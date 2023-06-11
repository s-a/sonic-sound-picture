import * as React from 'react';
import * as ReactDOM from 'react-dom/client';
import nicejob from './nicejob.js';
import SetupSection from './setup-section.jsx';
import FileInput from './fileinput.jsx';
import TemplateItem from './templateitem.jsx';
import Wav from './wav.jsx';
import ConfigItem from './configitem.jsx';
import ApplicationWorkSpace from './ApplicationWorkSpace.jsx';
import ApplicationMenu from './ApplicationMenu.jsx';
import ErrorBoundary from './errorboundary.jsx';
// import DemoMode from './demomode.jsx';
import SupportPage from './supportpage.jsx';
import UsernameInput from './UsernameInput.jsx';
import { JSONEditor } from "react-schema-based-json-editor"
import * as Icon from 'react-bootstrap-icons';
import NewTemplateInput from './new-template.jsx';


const schema = require('./template-schema-1.0.json')
const ProgressInfo = require('progress-info');
const semver = require('semver')

const ff = require('./ff.js');
const Log = require('./log.js');
const container = document.getElementById('gui');
const root = ReactDOM.createRoot(container);



window.log = new Log()
log.init()
let frames = 0

function getTimeFromSeconds(seconds) {
	const minutes = Math.floor(seconds / 60);
	seconds = seconds % 60;
	seconds = Math.round(seconds);
	return {
		minutes: minutes,
		seconds: seconds
	};
}

class App extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			bpm: 120,
			filename: "",
			frame_current: 0,
			executables: {
				blender: window.myAPI.load(`executables.blender`) || null,
				ffmpeg: window.myAPI.load(`executables.ffmpeg`) || null,
				ffprobe: window.myAPI.load(`executables.ffprobe`) || null,
				sonic_annotator: window.myAPI.load(`executables.sonic_annotator`) || null,
				qm_vamp_plugins: window.myAPI.load(`executables.qm_vamp_plugins`) || null,
			},
			templateConfigFormValid: false,
			gui: { persistent: window.myAPI.load('gui.persistent') },
			activeApplicationMenuIndex: 0
		}
		this.state.activeApplicationMenuIndex = this.configVerified() ? 1 : 0


		this.storagePath = window.myAPI.storageDataPath()
		this.templateConfigForm = React.createRef();
		this.nice = [
			nicejob.good(), nicejob.good(), nicejob.good(), nicejob.good()
		]
		this.bad = [
			nicejob.bad(), nicejob.bad(), nicejob.bad(), nicejob.bad()
		]

		this.resolutions = [
			{ name: "SD 720p 720 x 576", width: 720, height: 576 },
			{ name: "HD 1080p 1920 x 1080", width: 1920, height: 1080 },
			{ name: "-" },
			{ name: "9:16 1080 x 1920 (Instagram Reels / YouTube shorts)", width: 1080, height: 1920 },
			{ name: "1920 x 1200 (Twitter Video - Google fps and video length limitations)", width: 1920, height: 1200 },
			{ name: "-" },
			{ name: "4k DCI 4096 x 2160", width: 4096, height: 2160 },
			{ name: "4k UHDTV 3840 x 2160", width: 3840, height: 2160 },
			{ name: "4k UW 3840 x 1600", width: 3840, height: 1600 },

		]


		this.debugMode = window.myAPI.load(`debug`)
		this.developmentMode = window.myAPI.load(`development`)

		if (this.developmentMode) {
			//this.state.filename = "C:\\Users\\steph\\Desktop\\test_tone.wav"
			// this.state.filename = "C:\\Users\\steph\\Desktop\\test\\test_tone_short.wav"
			// this.state.filename = "C:\\Users\\steph\\Desktop\\test\\test_kick.wav"

			// this.state.filename = "C:\\Users\\steph\\Desktop\\test\\ELEKTRON.noise - Pitch Bull - 01 Pitch Bull.wav"
			// this.state.filename = "C:\\Users\\steph\\Desktop\\test\\test_kick2.wav"
			// this.state.filename = "C:\\Users\\steph\\Desktop\\Automatic 2022-11-18 1459.wav"
			this.state.filename = "C:\\Users\\steph\\Desktop\\test\\demo_mastered.wav"
			this.state.activeApplicationMenuIndex = 1
		}
	}

	// set wav filename
	setFilename(f) {
		if (f) {
			this.setState({ filename: f })
		}
	}

	// set executables
	setFile(filename, type) {
		const executables = this.state.executables
		executables[type] = filename
		this.setState({ executables })
	}

	readyToChooseTemplate() {
		return this.state.filename != null && this.state.filename !== "" && this.configVerified()
	}

	readyToDevliver() {
		return this.state.filename != null && this.state.filename !== "" && this.configVerified()
	}

	async componentDidMount() {

		const templates = await myAPI.getTemplates()
		const appVersion = await window.myAPI.getAppVersion()

		this.setState({
			appVersion: appVersion,
			templates: templates,
			templateConfigFormValid: this.templateConfigFormValid()
		})
		if (this.developmentMode) {
			this.onSelectTemplate(templates[1])
		}
		/* const s = await window.myAPI.openDirectory()
		if (!s.canceled) {
			console.log(s.filePaths[0])
		} */


	}

	componentWillUnmount() {
	}

	setBPM(bpm) {
		let b = bpm
		if (bpm.target) {
			b = bpm.target.value
		} else {
			b = bpm
		}
		if (b === 0) {
			b = 120
		}
		this.setState({ bpm: b })
	}

	verifyExecutable(filename, name) {
		const result = window.myAPI.fileExists(filename) && window.myAPI.rawFilename(filename) === name.toLowerCase()
		return result
	}

	directoryExists(directory) {
		try {
			const result = window.myAPI.fileExists(directory)
			return result
		} catch (error) {
			log.error(error)
			return false
		}
	}

	configVerified() {
		const result =
			this.verifyExecutable(this.state.executables.blender, 'blender') &&
			this.verifyExecutable(this.state.executables.ffmpeg, 'ffmpeg') &&
			this.verifyExecutable(this.state.executables.ffprobe, 'ffprobe') &&
			this.verifyExecutable(this.state.executables.sonic_annotator, 'sonic-annotator') &&
			this.verifyExecutable(this.state.executables.qm_vamp_plugins, 'qm-vamp-plugins')
		return result
	}

	renderWavLoaderState() {
		if (this.state.filename === '') {
			return (
				<div>
					<p className="lead text-primary">Please select one of your masterpices.</p>
				</div>
			)
		} else {
			if (this.state.filename === null) {
				return (
					<div>
						<p className="lead text-danger">{this.bad[1]}. Error decoding audio. Please try again.</p>
					</div>
				)
			} else {
				return (
					<div>
						<p className="lead text-success">"{this.state.filename}" - {this.nice[1]}. Select a template in the next step. </p>
					</div>
				)
			}
		}
	}

	renderWavInput() {
		if (this.configVerified()) {
			return (
				<section className="container-fluid">
					<div className="row">
						<div className="">
							<h3 className="fw-light">Audio file</h3>
							{this.renderWavLoaderState()}
							<Wav setBPM={this.setBPM.bind(this)} ffpropeApp={this.state?.executables?.ffprobe} setFilename={this.setFilename.bind(this)} filename={this.state.filename} />
						</div>
					</div>
				</section>
			)
		} else {
			return null
		}
	}

	onSelectTemplate(template) {
		this.nice[3] = nicejob.good()

		// create a shallow copy of template.config 
		const config = JSON.parse(JSON.stringify(template.config))

		for (let i = 0; i < config.parms.length; i++) {
			config.parms[i]._id = i

			if (config.parms[i].title === 'Songname') {
				config.parms[i].value = myAPI.getBasename(this.state.filename)
			}
		}

		this.setState({
			template: template,
			editedTemplateSettings: JSON.parse(myAPI.readFileSync(template.json).toString()),
			customUserTemplateConfiguration: config,
			// activeApplicationMenuIndex: this.state.activeApplicationMenuIndex + 1
		})
	}

	async onCloneTemplate() {
		const source = this.state.template.path
		const name = myAPI.getBasename(source)
		let destination = myAPI.pathJoin([myAPI.getUserTemplateFolder(), this.state?.gui?.persistent?.username || '@n-a'])
		destination = myAPI.pathJoin([destination, name])

		if (await myAPI.fileExists(destination)) {
			const r = window.confirm(`Folder "${destination}" already exists. Do you want to overwrite it?`)
			if (!r) {
				return
			}
		}

		console.log('copy', source, destination)
		await myAPI.copyDirectory(source, destination)
		const templates = (await myAPI.getTemplates())

		const template = templates.filter((t) => t.path === destination)[0]

		await this.setState({ templates, template })

	}

	async onCreateNewTemplateClick(templateName) {
		const staticFolder = await myAPI.applicationStaticFolder()
		const source = myAPI.pathJoin([staticFolder, 'default-template'])
		const name = myAPI.filenamify(templateName).replace(/ /g, '-')
		let destination = myAPI.pathJoin([myAPI.getUserTemplateFolder(), this.state?.gui?.persistent?.username || '@n-a'])
		destination = myAPI.pathJoin([destination, name])

		if (await myAPI.fileExists(destination)) {
			const r = window.confirm(`Folder "${destination}" already exists. Do you want to overwrite it?`)
			if (!r) {
				return
			}
		}

		console.log('copy', source, destination)
		await myAPI.copyDirectory(source, destination)
		const templates = (await myAPI.getTemplates())

		const template = templates.filter((t) => t.path === destination)[0]

		await this.setState({ templates, template })

	}

	resetTemplate() {
		this.setState({
			template: null,
			activeApplicationMenuIndex: this.state.activeApplicationMenuIndex - 1
		})
	}

	async onRefreshTemplateListClick() {
		const templates = (await myAPI.getTemplates())
		await this.setState({ templates })
	}

	setTemplateOverviewViewSize(size) {
		this.setState({ 'templateOverviewViewSize': size })
	}

	switchToTemplateEditMode(templateEditMode) {
		this.setState({
			templateEditMode: templateEditMode
		})
	}

	updateValue(config, valid) {
		this.setState({
			templateSettingsValid: valid,
			editedTemplateSettings: config
		})
	}

	async saveEditedTemplateJson(e) {
		myAPI.writeJsonFile(this.state.template.json, this.state.editedTemplateSettings)
		await this.onRefreshTemplateListClick()
		this.switchToTemplateEditMode(false)
	}
	JSONEditor() {
		return (
			<JSONEditor schema={schema}
				initialValue={this.state.editedTemplateSettings}
				updateValue={this.updateValue.bind(this)}
				theme="bootstrap5"
				icon="bootstrap-icons">
			</JSONEditor>
		)

	}

	async onExportTemplateClick() {
		const dir = await myAPI.openDirectory()
		if (!dir.canceled) {
			const targetDirectory = dir.filePaths[0]
			console.log(targetDirectory)
			if (myAPI.fileExists(myAPI.pathJoin([targetDirectory, 'template.blend']))) {
				window.alert(`${nicejob.bad()} - Do not use an existing template folder :/`)
			} else {
				try {
					await myAPI.exportTemplate(this.state.template.path, targetDirectory)
					window.alert(`${nicejob.good()} - Happy sharing!`)
				} catch (e) {
					window.alert(`${nicejob.bad()} - ${e.message}`)
				}
			}
		}
	}

	async onInstallTemplateClick() {
		const dir = await myAPI.openZipFile()
		if (!dir.canceled) {

			const zipFilename = dir.filePaths[0]
			console.log(zipFilename)

			try {
				await myAPI.installTemplate(zipFilename)
				window.alert(`${nicejob.good()} - The new template is ready to use!`)
				this.onRefreshTemplateListClick()
			} catch (e) {
				window.alert(`${nicejob.bad()} - ${e.message}`)
			}

		}
	}

	renderTemplateSelection() {
		const templates = (this.state.templates || []).map((template, index) => {
			return (
				<div key={template.key} className="col-sm-1" style={{ width: this.state.templateOverviewViewSize || '256px' }}> {/* TODO: make view editable by menu click */}
					<TemplateItem selected={this.state?.template?.path === template.path} template={template} idx={index} onSelect={this.onSelectTemplate.bind(this)} />
				</div>
			)
		})

		const isFactoryItem = (this.state?.template?.path || '').toLowerCase().indexOf('@factory') !== -1
		// this.state.customUserTemplateConfiguration

		return (this.state.templateEditMode ?
			<div>
				<h4>Edit: {this.state?.template?.name}</h4>
				{this.JSONEditor()}
				<button type="button" className={this.state.templateSettingsValid ? "btn btn-primary w-100 u" : "btn btn-primary w-100 u disabled"} onClick={this.saveEditedTemplateJson.bind(this)}>Save</button>
			</div> :
			(<div className="album">

				<div className="container-fluid">
					<div className="row">
						<ul className="nav nav-tabs">
							<li className="nav-item dropdown">
								<a className="nav-link dropdown-toggle" data-bs-toggle="dropdown" href="#" role="button" aria-haspopup="true" aria-expanded="false">Edit</a>
								<div className="dropdown-menu">
									<a title="Edit template.blend" className={!this.state.template || isFactoryItem ? 'dropdown-item disabled' : 'dropdown-item'} onClick={window.myAPI.open.bind(this, this.state?.template?.blend)} href="#" >
										template.blend
									</a>
									<a title="Edit template.json" className={!this.state.template || isFactoryItem ? 'dropdown-item disabled' : 'dropdown-item'} onClick={this.switchToTemplateEditMode.bind(this, true)} href="#" >
										template.json
									</a>
									<hr className="dropdown-divider" />
									<a title="Create a clone under your creator username in user templates system folder" className={!this.state.template || (this.state?.gui?.persistent?.username || '').trim() === '' ? 'dropdown-item disabled' : 'dropdown-item'} href="#" onClick={this.onCloneTemplate.bind(this)}>
										Clone
									</a>
									<hr className="dropdown-divider" />
									<a title="Open the template folder in your file explorer" className={!this.state.template ? 'dropdown-item disabled' : 'dropdown-item'} href="#" onClick={window.myAPI.open.bind(this, this.state?.template?.path)}>
										Browse
									</a>
									<hr className="dropdown-divider" />
									<a onClick={this.onInstallTemplateClick.bind(this)} title="Install template from zip archive" className={!this.state.template ? 'dropdown-item' : 'dropdown-item'} href="#">
										Install
									</a>
									<a onClick={this.onExportTemplateClick.bind(this)} title="Export file to zip archive to share with your friends" className={!this.state.template ? 'dropdown-item disabled' : 'dropdown-item'} href="#">
										Export
									</a>
								</div>
							</li>
							<li className="nav-item dropdown">
								<a className="nav-link dropdown-toggle" data-bs-toggle="dropdown" href="#" role="button" aria-haspopup="true" aria-expanded="false">View</a>
								<div className="dropdown-menu">
									<a className="dropdown-item" onClick={this.setTemplateOverviewViewSize.bind(this, '512px')}>Large</a>
									<a className="dropdown-item" onClick={this.setTemplateOverviewViewSize.bind(this, '256px')}>Medium</a>
									<a className="dropdown-item" onClick={this.setTemplateOverviewViewSize.bind(this, '128px')}>Small</a>
									<hr className="dropdown-divider" />
									<a className="dropdown-item" href="#" onClick={this.onRefreshTemplateListClick.bind(this)}>Refresh</a>
								</div>
							</li>
							<li className="nav-item">
								<UsernameInput app={this} onChangeSavePersistent={this.onChangeSavePersistent.bind(this)} />
							</li>
							<li className="nav-item">
								<NewTemplateInput app={this} onCreateNewTemplateClick={this.onCreateNewTemplateClick.bind(this)} onChangeSavePersistent={this.onChangeSavePersistent.bind(this)} />
							</li>
							{/* <li className="nav-item dropdown">
								<a className="nav-link dropdown-toggle" data-bs-toggle="dropdown" href="#" role="button" aria-haspopup="true" aria-expanded="false">Sort</a>
								<div className="dropdown-menu">
									<a className="dropdown-item" href="#">Date desc</a>
									<a className="dropdown-item" href="#">Name desc</a>
									<a className="dropdown-item" href="#">Date asc</a>
									<a className="dropdown-item" href="#">Name asc</a>
								</div>
							</li> */}

						</ul>

					</div>
				</div>
				<div className="container-fluid u">
					<div className="row row-cols-1 row-cols-sm-2 row-cols-md-3 g-3">
						{templates}
					</div>
				</div>
			</div>)
		)
	}

	onChangeTemplateConfig(config, value) {
		let items = [...this.state.customUserTemplateConfiguration.parms];
		let index = items.findIndex(item => item._id === config._id)
		config.value = value
		items[index] = config

		this.setState({ customUserTemplateConfiguration: { parms: items } });
		log.log(config, value)
		this.setState({ templateConfigFormValid: this.templateConfigFormValid() }) // FIXME: this is not efficient
	}

	renderTemplateConfigurations() {

		const result = []
		const config = this.state.customUserTemplateConfiguration
		this.curves = 0
		for (let i = 0; i < config.parms.length; i++) {
			const parm = config.parms[i];
			parm._id = i
			if (parm.type === "curve") {
				this.curves = this.curves + 1
			} else {
				parm.index = i
				const element = <ConfigItem onChangeSavePersistent={this.onChangeSavePersistent.bind(this)} appState={this} onChange={this.onChangeTemplateConfig.bind(this)} p={parm} key={"config-item-" + i} />;
				result.push(element)
			}
		}
		return result
	}

	templateConfigFormValid() {
		const form = this.templateConfigForm.current
		if (form) {

			// iterate over all form elements and validate them
			for (let i = 0; i < form.elements.length; i++) {
				const element = form.elements[i];
				if (!element.checkValidity()) {
					return false
				}
			}
			return true
		} else {
			return true
		}
	}

	renderTemplateConfiguration() {
		if (this.readyToChooseTemplate() && this.state.template) {
			const congifurationOptionsMessage = (this.state.customUserTemplateConfiguration.parms || []).filter((parm) => { return parm.type !== "curve" }).length > 0 ? (
				<div>
					The author provided some configuration options. You can change them down below.
				</div>) : (
				<div>
					The author provided no configuration options. Start render process or
					<br />
					<br />
					<button onClick={this.resetTemplate.bind(this)} type="button" className="btn btn-secondary btn-sm">Choose another template</button> <br /><br />
				</div>
			)

			return (
				<section className="container-fluid">
					<form action="" ref={this.templateConfigForm}>
						<div className="row">

							<h3 className="fw-light">Template Configuration</h3>
							<div className="lead text-muted d">
								{this.nice[3]}. The Template <strong>{this.state.template.name}</strong> by "{this.state.template.author}" will rock! 🤘🏻
								<br />
								{congifurationOptionsMessage}
							</div>
							<div className="row mb-3">
								{this.renderTemplateConfigurations()}
							</div>
						</div>
					</form>
				</section>
			)
		} else {
			return null
		}
	}

	open(f) {
		window.myAPI.open(f)
	}
	openConfig() {
		window.myAPI.open(this.storagePath)
	}
	openTemplateFolder() {
		window.myAPI.showTemplateFolder()
	}
	openFactoryTemplateFolder() {
		window.myAPI.showFactoryTemplateFolder()
	}
	openWebsite() {
		window.myAPI.open("https://app.gumroad.com/d/9d350138ae3725075fdf2cc6c651255a")
	}
	openLogFile() {
		window.myAPI.open(log.logFilename)
	}
	clearCache() {
		window.myAPI.clearCache()
	}
	execCancel(e) {
		e.preventDefault()
		window.myAPI.execCancel()
	}

	stderr(line) {
		this.setState({ stdout: line })
		console.error(line)
	}

	on__SSO_INTERNAL_MESSAGE(ssoInfo) {
		this.ssoInfo = ssoInfo
	}

	stdout(line) {
		const checkpointSize = 10
		if (line.startsWith(`{"__SSO_INTERNAL_MESSAGE": true`)) {
			const __SSO_INTERNAL_MESSAGE = JSON.parse(line)
			this.on__SSO_INTERNAL_MESSAGE(__SSO_INTERNAL_MESSAGE)
			log.info(__SSO_INTERNAL_MESSAGE)
			const frame_end = __SSO_INTERNAL_MESSAGE.frame_end

			const vTemplate = this.state?.template?.config?.minBlenderVersion || '3.3.1'
			const vBlender = __SSO_INTERNAL_MESSAGE?.blender_version || '3.3.1'

			let blenderVersionOk = null
			let blenderVersionMessage = null
			if (semver.valid(vTemplate) && semver.valid(vBlender)) {
				const coercedV1t = semver.coerce(vTemplate)
				const coercedV2b = semver.coerce(vBlender)
				blenderVersionOk = semver.gte(coercedV2b, coercedV1t)
				blenderVersionMessage = blenderVersionOk ? null :
					`Your Blender Version "${vBlender}" does not satisfy the predefined version which should at least "${vTemplate}" or higher for this template. Consider to update your Blender version.`
			}

			this.setState({
				frame_end,
				frame_current: 0,
				progress: 0,
				blender: {
					versionOK: blenderVersionOk,
					versionMessage: blenderVersionMessage
				}
			})

			this.progressInfo = new ProgressInfo(frame_end, checkpointSize);
		}

		if (line.startsWith(`Append frame `)) {
			frames = frames + 1
			const frame_current = parseInt(line.split(" ")[2])
			let tx = this.state.tx
			if (this.progressInfo && frames % checkpointSize == 0) {
				tx = `-${this.progressInfo.estimatedTime(frame_current)} remaining...`

				try {
					const txx = parseFloat(this.progressInfo.estimatedTime(frame_current).replace(' seconds', ''))
					const txxx = getTimeFromSeconds(txx)
					tx = `${txxx.minutes} minutes and ${txxx.seconds} seconds remaining...`
				} catch (ex) {

				}
				this.progressInfo.checkpoint()
			}
			this.setState({
				frame_current,
				progress: frame_current / this.state.frame_end * 100,
				tx
			})

		}
		this.setState({ stdout: line.split(' | Time:')[0] })

		if (this.debugMode) {
			// todo use a pro log library
			log.log(line)
		}
	}


	setStatus(status, progress) {
		const stat = {
			executing: true,
			stdout: '',
			exitcode: null,
			mainProgressStep: status,
			targetFilename: null,
		}
		if (progress !== undefined) {
			stat.mainProgress = progress
		}
		this.setState(stat)
	}

	async exec(e) {
		frames = 0
		this.setState({
			lastError: null
		})

		const tempFolder = await window.myAPI.tempDirectory()
		log.log("tempFolder", tempFolder)
		log.reset()

		e.preventDefault()
		const self = this

		const outputType = window.document.getElementById('cboOutputType').value
		const outputFrames = window.document.getElementById('cboOutputFrames').value || -1
		const outputResolution = window.document.getElementById('cboOutputResolution').value || -1
		const outputWithFX = window.document.getElementById('cboOutputWithFX').checked
		const outputFps = window.document.getElementById('cboOutputFps').value
		const outputTransparent = window.document.getElementById('cboOutputTransparent').checked

		const resolutionConfig = this.resolutions[parseInt(window.document.getElementById('cboResolution').value, 10)]
		const outputResolutionX = resolutionConfig.width
		const outputResolutionY = resolutionConfig.height


		const hash0 = await window.myAPI.hashValue(this.state.template.json, 'GUID')
		const hash = await window.myAPI.hashValue(this.state.filename, hash0)


		const filename = this.state.filename
		const filenameWithoutExtension = filename.substring(0, filename.lastIndexOf('.'))

		const outputFilename = `${filenameWithoutExtension}_${await myAPI.filenamify(this.state.template.name)}`

		const extensions = {
			'video': 'mov',
			'image': 'png',
			'blender': 'blend'
		}

		const ext = extensions[outputType]
		if (!ext) {
			throw new Error(`Unknown output type "${outputType}"`)
		}
		const fn = outputFilename + '.' + ext
		if (await myAPI.fileExists(fn)) {
			const r = window.confirm(`File "${fn}" already exists. Do you want to overwrite it?`)
			if (!r) {
				return
			}
		}
		const pyCodeFile = await window.myAPI.staticFile('static/render.py')

		try {
			// TODO: add license agreements
			const jobs = []

			const blenderParms = [
				'--factory-startup',
				'--disable-autoexec',
				'--background', this.state.template.blend,
				'--python-exit-code', '1',
				'--python', pyCodeFile.path,
				'--',
				'--working_directory', tempFolder,
				'--session_id', hash,
				'--output_frames', outputFrames.toString(),
				'--output_resolution', outputResolution.toString(),
				'--output_using_compositor_node', outputWithFX.toString(),
				'--output_transparent', outputTransparent.toString(),
				'--output_fps', outputFps.toString(),
				'--output_resolution_x', outputResolutionX,
				'--output_resolution_y', outputResolutionY,
				'--input', filenameWithoutExtension,
				'--output_filename', outputFilename
			]

			jobs.push({
				title: "Prepare render",
				f: async () => {
					const res = await window.myAPI.exec({
						cwd: tempFolder,
						cmd: this.state.executables.blender,
						parms: blenderParms.concat(['--output_type', 'info']),
						stdout: self.stdout.bind(self),
						stderr: self.stderr.bind(self)
					})
					log.log(res)
				}
			})

			jobs.push({
				title: `Identify song segments (Intro, Verse, Chorus, Bridge, Outro etc...)`,
				f: async () => {
					try {
						const script = ff.sonic_annotator_barbeattracker_transform_script(this.state.bpm)
						const transformFilename = myAPI.tempWrite(script)
						const parms = ff.sonic_annotator(this.state.filename, transformFilename)
						const cwd = myAPI.getPath(this.state.executables.sonic_annotator)
						await window.myAPI.simpleExec(this.state.executables.sonic_annotator, parms, cwd)
						let outputFilename = `${filenameWithoutExtension}_vamp_qm-vamp-plugins_qm-segmenter_segmentation.csv`
						let s = await window.myAPI.readFileSync(outputFilename)
						await myAPI.deleteFile(transformFilename)
						await myAPI.deleteFile(outputFilename)
						const sections = s.split('\n').map((row) => {
							const r = row.trim().split(',')
							const result = {
								id: parseInt(r[2], 10),
								segment: (r[3] || '').replace(/"/g, ''),
								start: parseFloat(r[0]),
								end: parseFloat(r[1])
							}
							return result
						}).filter((s) => s.segment !== '')

						outputFilename = `${filenameWithoutExtension}_vamp_qm-vamp-plugins_qm-barbeattracker_beats.csv`
						s = await window.myAPI.readFileSync(outputFilename)
						await myAPI.deleteFile(outputFilename)
						const beats = s.split('\n').map((row) => {
							const r = row.trim().split(',')
							const result = {
								id: parseInt(
									(r[1] || '').replace(/"/g, '')
									, 10),
								start: parseFloat(r[0])
							}
							return result
						}).filter((s) => !isNaN(s.id))

						const jsonDataBridge = JSON.parse(JSON.stringify(this.state.customUserTemplateConfiguration))
						jsonDataBridge.sections = sections
						jsonDataBridge.beats = beats
						jsonDataBridge.bpm = parseInt(this.state.bpm, 10)
						const jsonFilename = window.myAPI.pathJoin([tempFolder, `${hash}.json`])
						console.log('jsonFilename', jsonFilename)
						window.myAPI.writeJsonFile(jsonFilename, jsonDataBridge)
					} catch (e) {
						console.error(e)
						const jsonDataBridgeFallback = JSON.parse(JSON.stringify(this.state.customUserTemplateConfiguration))
						jsonDataBridgeFallback.sections = []
						jsonDataBridgeFallback.beats = []
						jsonDataBridgeFallback.bpm = parseInt(this.state.bpm, 10)
						const jsonFilename = window.myAPI.pathJoin([tempFolder, `${hash}.json`])
						console.warn('fallback jsonFilename', jsonFilename)
						window.myAPI.writeJsonFile(jsonFilename, jsonDataBridgeFallback)
						this.setState({
							songFeatureDetectionFailed: true
						})
					}
				}
			})

			jobs.push({
				title: `Split audio frequency spectrum ranges`,
				f: async () => {
					const numberOfBands = this.ssoInfo.required_frequency_bands
					if (numberOfBands == null) {
						throw new Error('numberOfBands is null')
					}
					const cachedFilenames = Array.from({ length: numberOfBands }, (v, i) => window.myAPI.pathJoin([tempFolder, `${hash}_BAND_${i}.wav`]))
					let allExist = true
					for (const filename of cachedFilenames) {
						if (!window.myAPI.fileExists(filename)) {
							allExist = false
							break
						} else {
							log.log("use chache", filename)
						}
					}

					//  Skip if number of bands is 1
					if (cachedFilenames.length == 1) {
						const x = filenameWithoutExtension + '.wav'
						await window.myAPI.copyFile(x, cachedFilenames[0])
						log.log("skip frequqncy analysis and using original audio file")
						log.log("copy", x, cachedFilenames[0])
						allExist = true
					}

					if (!allExist) {
						let parms = ff.mpeg(this.state.filename, tempFolder, numberOfBands, hash)
						log.log(parms)

						try {
							let res = await window.myAPI.exec({
								cwd: tempFolder,
								cmd: this.state.executables.ffmpeg,
								parms,
								stdout: self.stdout.bind(self),
								stderr: self.stderr.bind(self)
							})
							log.log(res)
						} catch (e) {
							// delete all cached files if exists
							for (const filename of cachedFilenames) {
								if (window.myAPI.fileExists(filename)) {
									log.log("delete", filename)
									window.myAPI.deleteFile(filename)
								}
							}
							throw e
						}
					}
				}
			})

			jobs.push({
				title: `Compile frequency spectrum analysis`,
				f: async () => {
					const numberOfBands = this.ssoInfo.required_frequency_bands
					const filenames = Array.from({ length: numberOfBands }, (v, i) => `${hash}_BAND_${i}`)
					for (let i = 0; i < filenames.length; i++) {
						const fn = filenames[i];
						jobs.push({
							title: `Analyse audio peak levels (frequency spectrum ${i + 1}/${numberOfBands})`,
							f: async function (fn) {
								const p = ff.probe(fn + ".wav")
								const csvFilename = window.myAPI.pathJoin([tempFolder, fn + ".csv"])
								if (window.myAPI.fileExists(csvFilename)) {
									log.log("use cache", csvFilename)
								} else {
									try {
										const res = await window.myAPI.exec({
											cwd: tempFolder,
											cmd: this.state.executables.ffprobe,
											parms: p,
											//stdout: self.stdout.bind(self),
											//stderr: self.stderr.bind(self),
											pipeToFile: csvFilename
										})
									} catch (e) {
										// delete csv file if exists
										if (window.myAPI.fileExists(csvFilename)) {
											log.log("delete", csvFilename)
											window.myAPI.deleteFile(csvFilename)
										}
										throw e
									}
								}
							}.bind(this, fn)
						})
					}

					jobs.push({
						title: "Render",
						f: async () => {
							const res = await window.myAPI.exec({
								cwd: tempFolder,
								cmd: this.state.executables.blender,
								parms: blenderParms.concat(['--output_type', outputType]),
								stdout: self.stdout.bind(self),
								stderr: self.stderr.bind(self)
							})
							log.log(res)
						}
					})
				}
			})

			this.setStatus(`Preparing the impossible...`, 0)
			let j = 0
			while (j < jobs.length) {
				const job = jobs[j];
				this.setStatus(`${job.title}...`)
				await job.f()
				const progressInPercent = (j + 1) / jobs.length * 100
				this.setStatus(`${job.title} done.`, progressInPercent)
				j = j + 1
			}

			const targetFolder = await myAPI.getPath(fn)
			this.setState({
				executing: false,
				exitcode: 0,
				tx: null,
				mainProgress: 100,
				targetFilename: fn,
				targetFolder
			})
		} catch (e) {
			this.setState({
				executing: false,
				exitcode: 1,
				stdout: e.toString()
			})
			const msg = e.message.split('\n')
			let output = false
			for (let i = 0; i < msg.length; i++) {
				const m = msg[i];
				output = output || m.startsWith('Blender')
				if (output) {
					log.error(m)
				}
			}
			log.error({ stderr: e })
			this.setState({
				lastError: e.message
			})
		}
	}

	async chooseOutputDir() {
		log.log(await window.myAPI.openDirectory(['openDirectory']))
	}

	onChangeSavePersistent(e) {
		let value = e.target.value
		if (e.target.type === 'checkbox') {
			value = e.target.checked
		}

		const key = 'gui.persistent.' + e.target.id
		window.myAPI.save(key, value)

		const x = JSON.parse(JSON.stringify(this.state.gui.persistent))
		x[e.target.id] = value
		this.setState({ gui: { persistent: x } })

		log.log(key, value)
	}

	copyRenderErrorMessage() {
		myAPI.copyToclipboard('```bash\n' + this.state.lastError + '\n```')
		this.setState({
			errorMessageCopied: true
		})
	}

	renderDeliverySection() {
		let action = null
		if (this.state.executing) {
			action = <button onClick={this.execCancel.bind(this)} type="button" className="btn btn-secondary btn-sm">Cancel</button>
		} else {
			action = <button onClick={this.exec.bind(this)} type="button" className="btn btn-primary btn-sm">Start</button>
		}
		let stdoutColor = "text-nowrap text-primary"
		switch (this.state.exitcode) {
			case 0:
				stdoutColor = "text-nowrap text-success"
				break
			case 1:
				stdoutColor = "text-nowrap text-danger"
				break
		}

		const lowerBlenderVersionMessage = this.state?.blender?.versionOK === false ? (
			<div className="alert alert-warning" role="alert">
				<p className="lead">
					{this.state?.blender?.versionMessage}
				</p>
			</div>
		) : null

		// if (!this.configVerified() || !this.state.filename || !this.state.template || !this.templateConfigFormValid())
		//if (this.readyToChooseTemplate() && this.templateConfigFormValid() && this.state.template) {
		if (true) {
			const inputPropsSpecialFX = {}
			if (this.state?.customUserTemplateConfiguration?.allowCompositionNode) {
				inputPropsSpecialFX.disabled = false
			} else {
				inputPropsSpecialFX.disabled = true
			}
			const inputPropsTransparency = {}
			if (!this.state?.customUserTemplateConfiguration?.allowTransparent) {
				inputPropsTransparency.disabled = 'disabled'
			}

			const cboResolutionItems = this.resolutions.map((r, i) => {

				return <option disabled={r.width === undefined} key={i} value={i}>{r.name}</option>
			})

			return (
				<section className="container-fluid">
					<h3 className="fw-light" style={{ 'color': this.state.songFeatureDetectionFailed === true ? 'red' : null }}>Features</h3>
					<div className="row">
						<div className="col-sm-12">
							<span className="fw-light">Detected BPM (Adjust this value if necessary; the more accurate, the better.)</span>
							<input onChange={this.setBPM.bind(this)} defaultValue={this.state?.bpm} id="cboBPM" type="number" className="form-control" min={0} max={800} placeholder="" aria-label="default input example" />
						</div>
					</div>

					<h3 className="fw-light u">Render Options</h3>
					<div className="row">
						<div className="col-sm-2">
							<span className="fw-light">Format</span>
							<select onChange={this.onChangeSavePersistent.bind(this)} id="cboResolution" defaultValue={this.state?.gui?.persistent?.cboResolution || 0} className="form-select">
								{cboResolutionItems}
								<option disabled value="">TODO: custom. Coming next version?</option>
							</select>
						</div>
						<div className="col-sm-1">
							<span className="fw-light">FPS</span>
							<select onChange={this.onChangeSavePersistent.bind(this)} id="cboOutputFps" defaultValue={this.state?.gui?.persistent?.cboOutputFps || 30} className="form-select">
								<option value="24">24 fps</option>
								<option value="25">25 fps</option>
								<option value="30">30 fps (Recomended)</option>
								<option value="60">60 fps</option>
							</select>
						</div>
						<div className="col-sm-2">
							<span className="fw-light">Frame(s)</span>
							<input onChange={this.onChangeSavePersistent.bind(this)} id="cboOutputFrames" type="number" className="form-control" min={0} placeholder="Empty for all" aria-label="default input example" />
						</div>
						<div className="col-sm-2">
							<span className="fw-light">Type</span>
							<select onChange={this.onChangeSavePersistent.bind(this)} id="cboOutputType" defaultValue={this.state?.gui?.persistent?.cboOutputType || "video"} className="form-select">
								<option value="image">Image</option>
								<option value="video">Video</option>
								<option value="blender">Blend file</option>
							</select>
						</div>
						<div className="col-sm-2">
							<span className="fw-light">Resolution</span>
							<input onChange={this.onChangeSavePersistent.bind(this)} id="cboOutputResolution" type="number" className="form-control" defaultValue={this.state?.gui?.persistent?.cboOutputResolution || 100} min={25} max={200} step={5} placeholder="Resolution in %" aria-label="default input example" />
						</div>
						<div className="col-sm-2">
							<span className="fw-light">Options</span>
							<div className="form-check" >
								<input {...inputPropsSpecialFX} onChange={this.onChangeSavePersistent.bind(this)} id="cboOutputWithFX" defaultChecked={this.state?.customUserTemplateConfiguration?.allowCompositionNode && (this.state?.gui?.persistent?.cboOutputWithFX)} className="form-check-input" type="checkbox" value="" />
								<label className="form-check-label" htmlFor="cboOutputWithFX" title='(Composition node in Blender will slow down the render!). Render without FX to compose your own in a video editing software.'>
									Special FX
								</label>
							</div>
							<div className="form-check" >
								<input {...inputPropsTransparency} onChange={this.onChangeSavePersistent.bind(this)} id="cboOutputTransparent" defaultChecked={this.state?.customUserTemplateConfiguration?.allowTransparent && (this.state?.gui?.persistent?.cboOutputTransparent)} className="form-check-input" type="checkbox" value="" />
								<label className="form-check-label" htmlFor="cboOutputTransparent">
									Transparent
								</label>
							</div>
						</div>
						<div className="col-sm-1">
							<span className="fw-light">Render</span><br />
							{action}
						</div>
					</div>
					<div className="row u">
						<h3 className="fw-light">Status</h3>
						{lowerBlenderVersionMessage}
						<div className={"col-12 text-truncate " + stdoutColor}>
							<span>{this.state.mainProgressStep}</span>
							<div className="progress" style={{ height: '1px', marginBottom: '11px', marginTop: '11px' }}>
								<div className="progress-bar" role="progressbar" style={{ width: ((this.state.mainProgress) || 0) + "%" }} aria-valuenow={this.state.mainProgress || 0} aria-valuemin="0" aria-valuemax="100"></div>
							</div>
							<div className="progress" style={{ height: '20px' }}>
								<div style={{ width: (this.state.progress || 0) + "%" }} className="progress-bar" role="progressbar" aria-valuenow={this.state.frame_current || 0} aria-valuemin="0" aria-valuemax={this.state.frame_end}></div>
							</div>
							{this.state.stdout}
						</div>
						<div className={"col-12 text-truncate text-muted"}>
							{this.state.tx}
						</div>
						{this.state.targetFilename ? (
							<div className={"col-12 text-truncate text-muted u"}>
								<a className='btn btn-primary btn-sm' href="#" onClick={this.open.bind(this, this.state.targetFilename)}>{this.state.targetFilename}</a> ➡️ <a href="#" className='btn btn-secondary btn-sm' onClick={this.open.bind(this, this.state.targetFolder)}>{this.state.targetFolder}</a>
							</div>
						) : null}
						{(this.state.lastError ?
							<div>
								<pre><code id="application-render-error-message" className={"col-12 text-danger"}>
									{this.state.lastError}
								</code></pre>
								<button onClick={this.copyRenderErrorMessage.bind(this)} type="button" className={"btn btn-" + (this.state?.errorMessageCopied ? "secondary" : "primary") + " btn-sm"}>Copy Error To Clipboard</button>
							</div>
							: null)}
					</div>
				</section>
			)
		} else {
		}
	}

	onChangeWorkspace(index) {
		this.switchToTemplateEditMode(false)
		this.setState({ activeApplicationMenuIndex: index })
	}

	render() {
		if (this.state.failure) {
			return <h1>I listened to your problems, now listen to mine: {this.state.exception}</h1>;
		}

		const workspaces = [
			{
				title: 'Settings',
				content: <SetupSection setFile={this.setFile.bind(this)} executables={this.state.executables} configVerified={this.configVerified.bind(this)} />,
				disabled: function () {
					return false
				}.bind(this)

			},
			{
				title: 'Audio',
				content: this.renderWavInput(),
				disabled: function () {
					return !this.configVerified()
				}.bind(this)
			},
			{
				title: 'Template',
				content: this.renderTemplateSelection(),
				disabled: function () {
					return !this.configVerified() || !this.state.filename
					// return this.state.filename !== null
				}.bind(this)
			},
			{
				title: 'Template Options',
				content: this.renderTemplateConfiguration(),
				disabled: function () {
					return !this.configVerified() || !this.state.filename || !this.state.template
					// return this.state.filename !== null
				}.bind(this)
			},
			{
				title: 'Deliver',
				content: this.renderDeliverySection(),
				disabled: function () {
					return !this.configVerified() || !this.state.filename || !this.state.template || !this.templateConfigFormValid()
					// return this.state.filename !== null
				}.bind(this)
			},
			{
				title: '❤️',
				content: <SupportPage />,
				disabled: function () {
					return false
				}.bind(this)
			}
		]
		return (
			<div>
				<ApplicationMenu app={this} />
				<main>
					<div className='container-fluid'>
						<ApplicationWorkSpace app={this} onChangeWorkspace={this.onChangeWorkspace.bind(this)} workspaces={workspaces} menuIndex={this.state.activeApplicationMenuIndex}></ApplicationWorkSpace>
					</div>
				</main>
			</div >
		);
	}
}

root.render(<ErrorBoundary> <App /></ErrorBoundary >);

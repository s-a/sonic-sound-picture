import * as React from 'react';

class FileInput extends React.Component {
	constructor(props) {
		super(props);
		this.setup = myAPI.setup()
		this.state = {
			file: this.verifyExecutable(this.props.file) ? this.props.file : null,
			disabledDownload: this.props.code === 'blender' || !this.setup.downloadConfig[this.setup.os] || !this.setup.downloadConfig[this.setup.os][this.props.code.replace(/_/g, '-')]
		};
		this.platform = myAPI.platform()

	}


	componentDidMount() {
	}

	componentWillUnmount() {
	}

	async locateBlender() {
		try {
			const x = await window.myAPI.getBlenderLocation()
			console.log(x)
			const filename = x.exe
			this.setState({ file: filename })
			window.myAPI.save(`executables.${this.props.code}`, filename)
			this.props.onChange(filename, this.props.code)
		} catch (e) {
			this.setState({ findError: e.message })
		}

	}

	verifyExecutable(filename) {
		const name = this.props.app
		const result = window.myAPI.fileExists(filename) && window.myAPI.rawFilename(filename).toLowerCase().indexOf(name.toLowerCase()) !== -1
		return result
	}

	change(e) {
		if (e.target.files.length !== 0) {
			const filename = e.target.files[0].path
			if (this.verifyExecutable(filename)) {
				this.setState({ file: filename })
				window.myAPI.save(`executables.${this.props.code}`, filename)
				this.props.onChange(filename, this.props.code)
			} else {
				alert("The file you selected is not the valid " + this.props.app + " executable")
				e.target.value = null
			}
		}
	}

	onResetClick(e) {
		this.setState({ file: null })
		this.props.onChange('', this.props.code)
		if (this.props.code === "ffmpeg") {
			this.props.onChange('', 'ffprobe')
		}
	}

	async onInstallClick(e) {
		try {
			const self = this
			this.setState({ installing: true })
			const targetDirectory = await myAPI.binaryFolder()
			const tempDirectory = await myAPI.tempDirectory()

			const config = await window.myAPI.downloadAndUnzip(targetDirectory, tempDirectory, this.props.code, function (state) {
				self.setState({ downloadProgress: state.progress, setupAction: state.action })
			})

			const tool = config.files[0]
			const filename = window.myAPI.setupGetExecutable(targetDirectory, this.props.code, tool)
			this.setState({ file: filename, installing: false })
			window.myAPI.save(`executables.${this.props.code}`, filename)
			this.props.onChange(filename, this.props.code)

			if (this.props.code === "ffmpeg") {
				const fn = filename.replace("ffmpeg", "ffprobe")
				window.myAPI.save(`executables.ffprobe`, fn)
				this.props.onChange(fn, 'ffprobe')
				// FIXME: reload window
				window.alert("I restart the app")
				window.location.reload()
			}

		} catch (e) {
			console.error(e)
			this.setState({ installing: false, error: e.message })
		}
	}

	download(e) {
		window.myAPI.open(this.props.downloadUrl)
		e.preventDefault()
	}

	render() {
		const id = "file_input__" + this.props.app.toLowerCase();
		let cls = ""
		let result = null
		const options = {
			// accept: this.props.app === "qm-vamp-plugins" ? "" : "application/x-ms-dos-executable, application/x-msdownload, application/exe, application/x-exe, application/dos-exe, application/x-binary, application/octet-stream",
		}

		if (this.verifyExecutable(this.state.file)) {
			result = (
				<div data-v={this.props.v} className="row d">
					<div className="col-sm-10">
						<strong className={"form-label"}>{this.props.app}</strong><br />
						<span className={"form-span text-success"}>{this.state.file}</span>
					</div>
					<div className="col-sm-2">
						<br />
						<button onClick={this.onResetClick.bind(this)} type="button" className="btn btn-warning w-100">Reset</button>
					</div>
				</div>
			);

		} else {
			result = (
				<div data-v={this.props.v} className="row d">
					<div className="col-sm-2">
						{this.state.installing ? (
							<div>
								<label className={"form-label text-secondary"}>Download</label><br />
								<label className={"form-label text-primary"} title={this.state.setupAction || 'Please wait'}>Please Wait...</label><br />
								<div className="progress">
									<div className="progress-bar progress-bar-striped progress-bar-animated" role="progressbar" aria-valuenow="75" aria-valuemin="0" aria-valuemax="100" style={{ width: this.state.downloadProgress + "%" }}></div>
								</div>
							</div>
						) : (
							<div>
								<label className={"form-label text-primary"}>Auto Download</label><br />
								{this.state.error ? (
									<div><strong>Please install manual. Error: </strong><span className="text-danger">{this.state.error}</span></div>
								) : (
									<button disabled={this.state.disabledDownload} onClick={this.onInstallClick.bind(this)} type="button" className="btn btn-primary w-100">Install</button>
								)}
							</div>
						)}
					</div>
					<div className="col-sm-3">
						<div className="row">
							{this.props.code === 'blender' ? (
								<div className="col-sm-6">
									<label className={"form-label text-secondary"}>Auto Locate</label><br />
									{this.state.findError ? (
										<div><strong>Error: </strong><span className="text-danger">{this.state.findError}</span></div>
									) : (
										<button onClick={this.locateBlender.bind(this)} type="button" className="btn btn-secondary w-100" title='If you already installed Blender on your system you can try to find the Program automatically.'>Try Find</button>
									)}
								</div>
							) : (null)}
							<div className={"col-sm-" + (this.props.code === 'blender' ? '6' : '12')}>
								<label className={"form-label text-secondary"}>Manual Download</label><br />
								<button onClick={this.download.bind(this)} type="button" className="btn btn-secondary w-100">Open Download Website</button>
							</div>
						</div>
					</div>
					<div className="col-sm-7">
						<strong><label htmlFor={id} className={"form-label text-primary"}>{this.props.app}:</label></strong> <small><i>{this.props?.hint ? `(${this.props?.hint})` : null}</i></small>
						<input {...options} onChange={this.change.bind(this)} id={id} type="file" className="form-control" aria-label={this.props.app + " file"} required />
					</div>
				</div>
			);
		}
		return result
	}
}

export default FileInput;
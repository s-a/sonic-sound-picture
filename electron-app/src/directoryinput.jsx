import * as React from 'react';

class DirectoryInput extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			file: this.verifyExecutable(this.props.file) ? this.props.file : null
		};
		this.platform = myAPI.platform();
		this.downloadConfig = {
			win32: {
				"qm-vamp-plugins": {
					url: "https://code.soundsoftware.ac.uk/attachments/download/2622/qm-vamp-plugins-1.8.0-win64.zip",
					files: [
						"qm-vamp-plugins-1.8.0-win64/qm-vamp-plugins.dll"
					]
				},
				"sonic-annotator": {
					url: "https://code.soundsoftware.ac.uk/attachments/download/2709/sonic-annotator-1.6-win64.zip",
					files: [
						"sonic-annotator-1.6-win64\\sonic-annotator.exe",
						"sonic-annotator-1.6-win64\\libsndfile-1.dll"
					]
				},
				"ffmpeg": {
					url: "https://github.com/GyanD/codexffmpeg/releases/download/5.1.2/ffmpeg-5.1.2-full_build.zip",
					files: [
						"ffmpeg-5.1.2-full_build/bin/ffmpeg.exe",
						"ffmpeg-5.1.2-full_build/bin/ffprobe.exe"
					]
				},
			}
		}
		if (!this.downloadConfig[this.platform]) {
			this.downloadConfig[this.platform] = {}
		}
	}


	componentDidMount() {
	}

	componentWillUnmount() {
	}

	verifyExecutable(filename) {
		const name = this.props.app
		const result = window.myAPI.fileExists(filename) && window.myAPI.rawFilename(filename).toLowerCase().indexOf(name.toLowerCase()) !== -1
		return result
	}

	change(filename) {
		this.setState({ file: filename })
		window.myAPI.save(`executables.${this.props.code}`, filename)
		this.props.onChange(filename, this.props.code)
	}

	onResetClick(e) {
		this.setState({ file: null })
		this.props.onChange('', this.props.code)
		if (this.props.code === "ffmpeg") {
			this.props.onChange('', 'ffprobe')
		}
	}

	async findBlender(e) {
		const dir = await window.myAPI.openDirectory()
		if (!dir.canceled) {
			const fn = await window.myAPI.pathJoin([dir.filePaths[0], 'Blender.app/Contents/MacOS/Blender'])
			this.change(fn)
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
								<label className={"form-label text-primary"}>Please wait...</label><br />
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
									<button disabled={!this.downloadConfig[this.platform][this.props.app]} type="button" className="btn btn-primary w-100">Install</button>
								)}
							</div>
						)}
					</div>
					<div className="col-sm-3">
						<label className={"form-label text-secondary"}>Manual Download</label><br />
						<button onClick={this.download.bind(this)} type="button" className="btn btn-secondary w-100">Open Download Website</button>
					</div>
					<div className="col-sm-7">
						<strong><label htmlFor={id} className={"form-label text-primary"}>{this.props.app}:</label></strong>
						<button onClick={this.findBlender.bind(this)} type="button" className="btn btn-primary w-100">
							{this.props.text}
						</button>
						<small><i>{this.props?.hint ? `(${this.props?.hint})` : null}</i></small>
						{/* <input {...options} onChange={this.change.bind(this)} id={id} type="button" webkitdirectory directory className="form-control" aria-label={this.props.app + " file"} required /> */}
					</div>
				</div>
			);
		}
		return result
	}
}

export default DirectoryInput;
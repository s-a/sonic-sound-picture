import React from 'react'
import FileInput from './fileinput.jsx';
import DirectoryInput from './directoryinput.jsx';

class SetupSection extends React.Component {
	render() {
		let result
		const cls = this.props.configVerified() ? "lead text-success hidden" : "lead text-danger "
		result = (
			<div className="container-fluid">
				<p className={cls}>
					Your machine configuration is not fine yet.
					But no worries. We can fix it together in a minute or two.
					Please install the following software and specify location of each component.
				</p>
				<p className={cls}>
					Why? Because this software is not yet able to find the following executables on your machine.
					And the mission is a very intense task of computational audio signal processing.
					To make it the fastest experience for you, we have to make sure that the software is able to find the following executables.
					This only needs to be done once and never again and most of them can be installed automatically 😏.
					The automatic setup focus on 64bit so if you run this on 32bit system the automatic setup will not work. I also cannot test non Windows systems. So if any auto process does not work take a look at the bug reports to do the steps manually.
				</p>

				<h3 className="fw-light">Required Software Components</h3>
				<div className='container-fluid'>
					{myAPI.platform() == 'win32' ?
						<FileInput downloadUrl="https://www.blender.org/download/" file={this.props.executables.blender} app="Blender" code="blender" onChange={this.props.setFile} />
						:
						<DirectoryInput downloadUrl="https://www.blender.org/download/" file={this.props.executables.blender} app="Blender" code="blender" onChange={this.props.setFile} text="Choose location of `Blender.app`" hint="Problems? look at https://bit.ly/3TokZwH" />
					}
					<FileInput downloadUrl="https://ffmpeg.org/download.html" file={this.props.executables.ffmpeg} app="ffmpeg" code="ffmpeg" onChange={this.props.setFile} />
					<FileInput downloadUrl="https://ffmpeg.org/download.html" file={this.props.executables.ffprobe} app="ffprobe" code="ffprobe" onChange={this.props.setFile} />

					<FileInput downloadUrl="https://code.soundsoftware.ac.uk/projects/sonic-annotator/files" file={this.props.executables.sonic_annotator} app="sonic-annotator" code="sonic_annotator" onChange={this.props.setFile} />
					<FileInput downloadUrl="https://code.soundsoftware.ac.uk/projects/qm-vamp-plugins/files" file={this.props.executables.qm_vamp_plugins} app="qm-vamp-plugins" code="qm_vamp_plugins" onChange={this.props.setFile} hint="Same direcory as sonic_annotator!" />
				</div>
			</div>
		)
		return result
	}
}

export default SetupSection
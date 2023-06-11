import React from 'react'

class ApplicationMenu extends React.Component {
	render() {
		// const reg = myAPI.load('registered')
		return (
			<nav className="navbar navbar-expand-sm navbar-dark bg-dark ">
				<div className="container-fluid">
					<button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
						<span className="navbar-toggler-icon"></span>
					</button>
					<div className="collapse navbar-collapse" id="navbarSupportedContent">
						<ul className="navbar-nav me-auto mb-2 mb-lg-0">
							<li className="nav-item dropdown">
								<a className="nav-link dropdown-toggle" href="#" id="navbarDropdown" role="button" data-bs-toggle="dropdown" aria-expanded="false">
									Sonic Sound Picture v{this.props.app.state.appVersion}
								</a>
								<ul className="dropdown-menu" aria-labelledby="navbarDropdown">
									<li><a onClick={myAPI.open.bind(this.props.app, 'https://github.com/s-a/sonic-sound-picture/blob/main/WORKFLOW.md')} className="dropdown-item" href="#">Help</a></li>
									<li><a onClick={myAPI.open.bind(this.props.app, 'https://discord.com/channels/1054281306055389304/1054281306055389308')} className="dropdown-item" href="#">Discord</a></li>
									<li><a onClick={myAPI.open.bind(this.props.app, 'https://discord.gg/MaKtp6jx3T')} className="dropdown-item" href="#">Discord (join server)</a></li>
									<li><hr className="dropdown-divider" /></li>
									<li><a onClick={this.props.app.openFactoryTemplateFolder.bind(this.props.app)} className="dropdown-item" href="#">Factory Templates</a></li>
									<li><a onClick={this.props.app.openTemplateFolder.bind(this.props.app)} className="dropdown-item" href="#">User Templates</a></li>
									<li><a onClick={this.props.app.openConfig.bind(this.props.app)} className="dropdown-item" href="#">Configuration</a></li>
									<li><hr className="dropdown-divider" /></li>
									<li><a onClick={this.props.app.clearCache.bind(this.props.app)} className="dropdown-item" href="#">Clear Cache</a></li>
									<li><a onClick={this.props.app.openLogFile.bind(this.props.app)} className="dropdown-item" href="#">Show Log</a></li>
									<li><hr className="dropdown-divider" /></li>
									<li><a className="dropdown-item" href="#" onClick={myAPI.open.bind(this, 'https://color.adobe.com/de/trends')}>https://color.adobe.com/de/trends</a></li>
									<li><a onClick={myAPI.open.bind(this.props.app, 'https://essentia.upf.edu/essentiajs-discogs/')} className="dropdown-item" href="#">Music Genre Autotagging (external tool)</a></li>
									<li><hr className="dropdown-divider" /></li>
									<li><a onClick={myAPI.open.bind(this, 'https://github.com/s-a/sonic-sound-picture/releases')} className="dropdown-item" href="#">Check For Updates</a></li>
									<li><a onClick={myAPI.open.bind(this, 'https://github.com/s-a/sonic-sound-picture/issues')} className="dropdown-item" href="#">Submit a bug</a></li>
									<li><a onClick={window.myAPI.toggleDevTools.bind(this.props.app)} className="dropdown-item" href="#">Toggle Console</a></li>
								</ul>
							</li>
						</ul>
					</div>
				</div>
			</nav>
		)
	}
}

export default ApplicationMenu
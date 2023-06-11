import * as React from 'react';
import ErrorSvg from './errorsvg.jsx';
import nicejob from './nicejob.js';

class ErrorBoundary extends React.Component {
	constructor(props) {
		super(props)
		this.state = { hasError: false };
	}

	copyToClipboard() {
		const id = "application-error-details"
		var r = document.createRange();
		r.selectNode(document.getElementById(id));
		window.getSelection().removeAllRanges();
		window.getSelection().addRange(r);
		document.execCommand('copy');
		window.getSelection().removeAllRanges();
		this.setState({ copied: true })
	}

	static getDerivedStateFromError(error) {
		return { hasError: true, error };
	}

	async componentDidMount() {
		try {
			this.state.appVersion = await window.myAPI.getAppVersion()
		} catch (e) {

		}
		try {
			this.state.osVersion = window.myAPI.getOsVersion()
		} catch (e) {

		}
	}

	componentDidCatch(error, info) {
		this.setState({ error, info })
		// logComponentStackToMyService(info.componentStack);
	}

	render() {
		try {

			const msg = []
			msg.push("App Version: " + this.state?.appVersion)
			msg.push("Operating System: " + this.state?.osVersion)
			msg.push('')
			msg.push("Error: " + this.state?.error?.message)
			msg.push("Stack: " + this.state?.error?.stack)
			msg.push('')
			msg.push(this.state?.info ? JSON.stringify(this.state?.info).replace(/\\n/g, '\n') : '')

			let a
			try {
				// const e = encode(, { mode: 'html5' });
				const m = msg.join('\n')
				a = m;
			} catch (error) {
				console.error(error)
				msg.push("Error while encoding error message: " + error.message)
			}
			const copiedMessage = this.state?.copied ? <span className='text-success'>
				{nicejob.good()} 👍
			</span> : ""
			if (this.state.hasError) {
				return (
					<div>
						<main className='u' style={{ marginTop: "42px" }}>
							<div className="container-fluid min-vh-100 d-flex flex-column">
								<div className="row d u">
									<div className="col">
										<h2>
											<span className="text-danger"><del>@*#%!$</del> {nicejob.bad()} -  Something happened that should never have happened.</span> <span>Sowwy :(</span>
										</h2>
									</div>
								</div>
								<hr />

								<div className="row u flex-nowrap" style={{ marginTop: "42px" }}>
									<div style={{ width: '420px', height: '482px' }}>
										<ErrorSvg height="90%" width="100%" viewBox="-300 -300 1500 1500" preserveAspectRatio="none" />
										<div className="row flex-grow-1">
											<div className="border-err">

											</div>
										</div>
									</div>
									<div className="col-md-auto">
										<h2><span className='flip'>What?</span> Absolutely no idea. But... <br />here are the infos these nerds <span className='flip'>need</span> to <span className='flip'>repair</span> the thing.</h2>
										<p>
										</p>
										<hr className='err' />
										<code className="" id="collapseExample">
											<pre id="application-error-details" style={{ height: '400px' }}>
												{a}
											</pre>
										</code>
										<p className='flip'>
											I know it's scary, but they need the weird stuff and the good Lord alone knows how they do what they do... So however let' s do it!
										</p>
										<button onClick={this.copyToClipboard.bind(this)} type="button" className="btn btn-info">Copy to clipboard</button> {copiedMessage}
										<button onClick={myAPI.open.bind(this, 'https://github.com/s-a/sonic-sound-picture/issues')} type="button" className="btn btn-info">Submit the Bug</button>
										<p className='u text-muted'>
											<i>
												Still not a member on Discord? No problem. Here is an <a href="#" onClick={myAPI.open.bind(this, 'https://discord.gg/MaKtp6jx3T')}>invitation</a>.
											</i>
										</p>
										<hr className='err' />
									</div>
								</div>
								<small className='u text-muted'>
									<i>
										In super rare cases devs need more infos. Here is the secret window for this much much more weirder stuff. Don' t care about it until needed. <a onClick={window.myAPI.toggleDevTools.bind(this.props.app)} href="#">Toggle Console</a>
									</i>
								</small>
							</div>
						</main >
					</div >
				);
			}
		} catch (e) {
			return <a onClick={window.myAPI.toggleDevTools.bind(this.props.app)} href="#">Toggle Console</a>
		}

		return this.props.children;
	}
}

export default ErrorBoundary;
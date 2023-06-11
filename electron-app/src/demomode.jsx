import React from 'react'
import QR from './qr.jsx'
class DemoMode extends React.Component {
	constructor(props) {
		super(props)


		this.state = {
			registered: myAPI.load('registered'),
			timer: 5,
		}

	}

	async componentDidMount() {
		this.interval = setInterval(() => {
			this.setState({ timer: this.state.timer - 1 })
			if (this.state.timer - 1 == 0) {
				clearInterval(this.interval)
			}
		}, 1800)
	}

	onContinueClick() {
		this.setState({ registered: true })
	}

	render() {
		return this.state.registered ? (this.props.children) : (
			<div className="container py-4 bg-light text-dark u">
				<header className="pb-3 mb-4 border-bottom">
					<a href="#" className="d-flex align-items-center text-dark text-decoration-none">
						<span className="fs-4">Please note that this a free software</span>
					</a>
				</header>
				<div className="row align-items-md-stretch">
					<div className="col-md-6">
						<div className="h-100 p-5 text-white bg-dark rounded-3">
							<h2>Donate Now 🤗</h2>
							<QR style={{}} className="d-flex" width={128} height={128} />
							<small>Doge: DADGqb3M8bCLawVk7Y7Exc92ZVG19YwQru</small>
							<div>
								<small>Support the development of the software and the poor dev created it with ❤️</small>
							</div>
						</div>
					</div>
					<div className="col-md-6">
						<div className="h-100 p-5 bg-light border rounded-3">
							<h2>Continue 🤨</h2>
							<p>You can continue to use the software without limitations.</p>
							<button disabled={this.state.timer > 0} onClick={this.onContinueClick.bind(this)} className="btn btn-outline-secondary" type="button">{`Continue ${this.state.timer > 0 ? `in ${this.state.timer}...` : 'now'}`}</button>
						</div>
					</div>
				</div>
			</div>
		)
	}
}

export default DemoMode
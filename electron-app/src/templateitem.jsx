import React from 'react'

import lic from './license.json'

class TemplateItem extends React.Component {
	constructor(props) {
		super(props);
		this.lic = lic[this.props.template.config.license || 'all-rights-reserved'] || lic['all-rights-reserved']
	}

	onSelect() {
		this.props.onSelect(this.props.template)
	}

	onClone() {
		this.props.onClone(this.props.template)
	}

	onVisitAuthor() {
		window.myAPI.open(this.props.template.config.url || 'https://github.com/s-a/sonic-sound-picture')
	}

	onVisitLicense() {
		window.myAPI.open(this.lic.url)
	}

	render() {
		const b64 = window.myAPI.image64(this.props.template.image)
		const imageClass = "bd-placeholder-img card-img-top"
		const UserTemplateIcon = <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="mutedColor" className="bi bi-person-circle" viewBox="0 0 16 16">
			<path d="M11 6a3 3 0 1 1-6 0 3 3 0 0 1 6 0z" />
			<path fillRule="evenodd" d="M0 8a8 8 0 1 1 16 0A8 8 0 0 1 0 8zm8-7a7 7 0 0 0-5.468 11.37C3.242 11.226 4.805 10 8 10s4.757 1.225 5.468 2.37A7 7 0 0 0 8 1z" />
		</svg>
		const FactoryTemplateIcon = <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="mutedColor" className="bi bi-gear-fill" viewBox="0 0 16 16">
			<path d="M9.405 1.05c-.413-1.4-2.397-1.4-2.81 0l-.1.34a1.464 1.464 0 0 1-2.105.872l-.31-.17c-1.283-.698-2.686.705-1.987 1.987l.169.311c.446.82.023 1.841-.872 2.105l-.34.1c-1.4.413-1.4 2.397 0 2.81l.34.1a1.464 1.464 0 0 1 .872 2.105l-.17.31c-.698 1.283.705 2.686 1.987 1.987l.311-.169a1.464 1.464 0 0 1 2.105.872l.1.34c.413 1.4 2.397 1.4 2.81 0l.1-.34a1.464 1.464 0 0 1 2.105-.872l.31.17c1.283.698 2.686-.705 1.987-1.987l-.169-.311a1.464 1.464 0 0 1 .872-2.105l.34-.1c1.4-.413 1.4-2.397 0-2.81l-.34-.1a1.464 1.464 0 0 1-.872-2.105l.17-.31c.698-1.283-.705-2.686-1.987-1.987l-.311.169a1.464 1.464 0 0 1-2.105-.872l-.1-.34zM8 10.93a2.929 2.929 0 1 1 0-5.86 2.929 2.929 0 0 1 0 5.858z" />
		</svg>
		const isFactoryItem = (this.props?.template.path || '').toLowerCase().indexOf('@factory') !== -1

		return <div className="card shadow-sm">
			<img style={{ cursor: 'pointer' }} onClick={this.onSelect.bind(this)} src={"data:image/png;base64," + b64} title={this.props.template.config.description + ' ' + this.props.template.path} className={imageClass} />
			<div className="card-body">
				<div className="d-flex">
					{this.props.selected ? (
						<span className="position-absolute top-0 start-100 translate-middle p-2 bg-danger border border-light rounded-circle">
							<span className="visually-hidden">New alerts</span>
						</span>
					) : null}
				</div>
				<p className="u">
					<small className=''>
						<span className="text-primary">
							{isFactoryItem ? FactoryTemplateIcon : UserTemplateIcon} {this.props.template.name}
						</span>
						<span className="text-muted"> v{this.props.template.config.version} by </span>
						<a className="text-primary" href="#" onClick={this.onVisitAuthor.bind(this)}>
							{this.props.template.author}
						</a>
					</small><br />
					<small title={this.lic.description}>
						License: <a className="text-muted" href="#" onClick={this.onVisitLicense.bind(this)}>{this.lic.name}</a>
					</small>
				</p>
			</div>
		</div>
	}
}

export default TemplateItem
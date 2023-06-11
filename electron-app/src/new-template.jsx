import React from 'react'

class NewTemplateInput extends React.Component {
	constructor(props) {
		super(props);
		this.myRef = React.createRef();
	}

	onchangeTemplateName(e) {
		const templateName = e.target.value
		this.setState({ templateName })
	}

	onSubmit(e) {
		return false
	}

	render() {
		return (
			<form onSubmit={this.onSubmit.bind(this)} id="template-name-input-form" className="navbar-form navbar-left i" role="template-name">
				<div className="input-group form-group input-group-sm">
					<input ref={this.myRef} style={{ marginTop: '6px' }} placeholder="New Template Name" onChange={this.onchangeTemplateName.bind(this)} pattern="[a-zA-Z0-9.\-\[\]{}~!$&amp;']+(?<![_. ])" type="text" className="form-control" aria-label="Recipient's username" aria-describedby="basic-addon2" />
					<div className="input-group-append">
						<button style={{ marginLeft: '3px', marginTop: '6px' }} disabled={(this?.state?.templateName || '') === ''} onClick={this.props.onCreateNewTemplateClick.bind(this, this?.state?.templateName)} className="btn btn-sm btn-outline-secondary" type="button">Create Template</button>
					</div>
				</div>
			</form>
		)
	}
}

export default NewTemplateInput
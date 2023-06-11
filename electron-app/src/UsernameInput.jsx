import React from 'react'

class UsernameInput extends React.Component {
	onChange(e) {
		const form = document.getElementById('username-input-form')
		const inputFields = form.querySelectorAll('input');

		inputFields.forEach((inputField) => {
			if (!inputField.checkValidity()) {
				inputField.reportValidity();
				if (inputField.value === '') {
					this.props.onChangeSavePersistent(e)
				}
			} else {
				this.props.onChangeSavePersistent(e)
			}
		})
	}

	render() {
		return (
			<form id="username-input-form" className="navbar-form navbar-left" role="username">
				<div className="form-group input-group-sm">
					<input required pattern="@[a-zA-Z0-9.\-\[\]{}~!$&amp;']+(?<![_. ])" defaultValue={this.props.app?.state?.gui?.persistent?.username} id="username" onChange={this.onChange.bind(this)} style={{ marginTop: '6px' }} type="text" className="form-control" placeholder="Creator artist name" title='your Creator username. Enter one to clone and use the edit functions. Start with @ sign, on characters valid in directory names are allowed. Restart the app when you changed this value for the first time.' />
				</div>
			</form>
		)
	}
}

export default UsernameInput
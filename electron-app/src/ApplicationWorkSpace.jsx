import React from 'react'

class ApplicationWorkSpace extends React.Component {
	render() {
		const currentMenuItem = this.props.menuIndex > this.props.workspaces.length - 1 ? 0 : this.props.menuIndex
		const menuitems = this.props.workspaces.map((item, index) => {
			let cls = index === currentMenuItem ? "nav-link active" : "nav-link"

			const workspace = this.props.workspaces[index]

			if (workspace.disabled()) {
				cls += " disabled"
			}
			return (
				<li className="nav-item" key={index}>
					<a onClick={this.props.onChangeWorkspace.bind(this, index)} className={cls} href="#">{item.title}</a>
				</li>
			)
		})

		const workspace = this.props.workspaces[currentMenuItem]
		return (
			<div className="card">
				<div className="card-header">
					<ul className="nav nav-pills card-header-pills">
						{menuitems}
					</ul>
				</div>
				<div className="card-body text-dark">
					{workspace.content}
				</div>
			</div>
		)
	}
}

export default ApplicationWorkSpace
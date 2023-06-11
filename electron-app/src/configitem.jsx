import React from 'react'


class ConfigItem extends React.Component {
	constructor(props) {
		super(props)
		this.persistentSettings = {
			"Band Name": {
				id: "setup__band_name",
			}
		}

		if (this.persistentSettings[this.props.p?.title]) {
			const id = 'gui.persistent.' + this.persistentSettings[this.props.p?.title].id
			this.state = { value: window.myAPI.load(id) }
			this.props.onChange(this.props.p, this.state.value)
		} else {
			this.state = { value: this.props.p.value }
		}
	}

	onChange = (e) => {
		let v = null
		if (!e) {
			v = ''
		} else {
			if (this.props.p.type === "file") {
				v = e.target.files[0].path
			} else {
				v = e.target.value
			}
		}
		this.props.onChange(this.props.p, v)
		this.setState({ value: v })
		if (this.persistentSettings[this.props.p?.title]) {
			this.props.onChangeSavePersistent(e)
		}
	}

	render() {

		let cls = ""
		let mainClassName = "col-sm-12 text-"
		let id = "setup__" + this.props.p.index
		if (this.persistentSettings[this.props.p?.title]) {
			id = this.persistentSettings[this.props.p?.title].id
		}

		const inputProps = {}
		if (this.props?.p?.accept) {
			inputProps.accept = this.props.p.accept
		}
		switch (this.props.p.type) {
			case "color":
				cls = "form-control form-control-color"
				break;
			default:
				cls = "form-control m-auto"
				break;
		}

		let inputControl = <input required  {...inputProps} onChange={this.onChange.bind(this)} ref={this.myRef} type={this.props.p.type} className={cls} id={id} />
		switch (this.props.p.type) {
			case "file":
				if (this.state.value || '' !== '') {
					inputControl = <div>
						<button onClick={this.onChange.bind(this, null)} type="button" className="btn btn-dark">Reset</button> <span>{this.state.value}</span>
					</div>
				} else {
					inputControl = <input required  {...inputProps} onChange={this.onChange.bind(this)} ref={this.myRef} type={this.props.p.type} className={cls} id={id} />
				}
				break;
			case "color":
				// inputProps.defaultValue = this.state.value  // template(this.props.appState)

				inputControl = <div className="row">
					<div className='col-md-1'>
						<input required value={this.state.value}  {...inputProps} onChange={this.onChange.bind(this)} ref={this.myRef} type={this.props.p.type} className={cls} id={id} />
					</div>
					<div className='col-md-3'>
						<input required value={this.state.value} onChange={this.onChange.bind(this)} className='form-control m-auto' required type="text" />
					</div>
				</div>
				break;
			default:
				/* const source = this.props.p.value || '';
				const template = myAPI.compileTemplate(source); */
				inputProps.defaultValue = this.state.value  // template(this.props.appState)
				inputControl = <input required  {...inputProps} onChange={this.onChange.bind(this)} ref={this.myRef} type={this.props.p.type} className={cls} id={id} />
				break;
		}

		return (
			<div className={mainClassName} style={{ 'marginBottom': '5px' }}>
				<div className="row">
					<label htmlFor={id} className="col-sm-4 col-form-label">
						{this.props.p?.title}
					</label>
					<div className="col-sm-8">
						{inputControl}
					</div>
				</div>
			</div >
		)
	}
}

export default ConfigItem
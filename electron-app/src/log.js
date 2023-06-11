
const Log = function () {
	return this
}

Log.prototype.init = async function () {
	// FIXME: FIX PERMISSION DENIED
	this.logFilename = await window.myAPI.pathJoin([await window.myAPI.homeDirectory(), 'ssp.log'])
	console.info(this.logFilename)
}

Log.prototype.reset = async function () {
	window.myAPI.deleteFile(this.logFilename)
}

Log.prototype.stringify = function (obj) {
	const result = typeof obj === 'string' ? obj : JSON.stringify(obj, (key, value) => {
		if (value === obj) {
			return;
		}
		return value;
	})
	return result
}

Log.prototype.argsToString = async function () {
	const result = []
	const args = Array.from(arguments)
	for (let a = 0; a < args.length; a++) {
		const arg = Array.from(args[a])

		for (let b = 0; b < arg.length; b++) {
			const e = arg[b];

			try {
				result.push(this.stringify(e));
			} catch (error) {
				// skip errors
			}
		}
	}


	return result
}

Log.prototype.writePersistent = async function (logType, args) {
	/* skip logging to file for now 
	const logEntry = await this.argsToString(args)
	try {
		const dt = new Date().toUTCString()
		const strings = [dt, `[${logType}]`].concat(logEntry);
		window.myAPI.appendLogFileEntry(this.logFilename, strings.join(' '));
	} catch (e) {
		console.error(`Unable to log:`, e);
	} 
	*/
}

Log.prototype.log = function () {
	console.log.apply(console, arguments)
	this.writePersistent('log', arguments)
}

Log.prototype.error = function () {
	console.error.apply(console, arguments)
	this.writePersistent('log', arguments)
}

Log.prototype.warn = function () {
	console.warn.apply(console, arguments)
	this.writePersistent('log', arguments)
}

Log.prototype.info = function () {
	console.info.apply(console, arguments)
	this.writePersistent('log', arguments)
}

Log.prototype.trace = function () {
	console.trace.apply(console, arguments)
	this.writePersistent('log', arguments)
}

module.exports = Log
/*
* Docs:
* https://docs.blender.org/manual/en/latest/advanced/blender_directory_layout.html
*/

import fs from 'fs'
import path from 'path'
import request from 'request'
import AdmZip from 'adm-zip'
import { execa } from 'execa'
import config from './downloads.js'

function Setup() {
	this.downloadConfig = config
	this.os = this.platform()
	return this
}

Setup.prototype.platform = function () {
	let result = 'linux'
	if (process.platform === 'win32') {
		result = 'win32'
	}
	if (process.platform === 'darwin') {
		result = 'macOS'
	}

	return result
}

Setup.prototype.getFilename = (fn) => {
	const result = path.parse(fn).base.toLowerCase()
	return result
}

Setup.prototype.download = (url, dest, e) => {
	return new Promise(function (resolve, reject) {
		const file = fs.createWriteStream(dest)
		const req = request.get(url)
		let len = 1
		let cur = 0
		let total = len / 1048576 // 1048576 - bytes in  1Megabyte
		req.on('response', function (data) {
			// console.log(data.headers['content-length'])
		})

		// verify response code
		req.on('response', (response) => {
			if (response.statusCode !== 200) {
				reject(new Error('Response status was ' + response.statusCode))
			}
			len = parseInt(response.headers['content-length'], 10)
			cur = 0
			total = len / 1048576 // 1048576 - bytes in  1Megabyte
			e({
				total,
				percent: (100.0 * cur / (len || 1)).toFixed(2)
			})

			req.pipe(file)
		})
		req.on('data', function (chunk) {
			cur += chunk.length
			e({
				total: len,
				percent: (100.0 * cur / (len || 1)).toFixed(2)
			})
		})

		// close() is async, call cb after close completes
		file.on('finish', () => file.close(resolve))

		// check for request errors
		req.on('error', (err) => {
			fs.unlink(dest, () => reject(new Error(err.message))) // delete the (partial) file and then return the error
		})

		file.on('error', (err) => { // Handle errors
			fs.unlink(dest, () => reject(new Error(err.message))) // delete the (partial) file and then return the error
		})
	})
}

Setup.prototype.unzip = function (zipFile, files, targetPath) {
	const zip = new AdmZip(zipFile)
	const x = zip.forEach(function (f) {
		const fn = f.entryName
		zip.extractEntryTo(/* entry name */ fn, /* target path */ targetPath, /* maintainEntryPath */ false, /* overwrite */ true)

	})
}

Setup.prototype.ungz = async function (gzFile, targetPath, stripComponents) {
	if (!fs.existsSync(targetPath)) {
		fs.mkdirSync(targetPath)
	}

	const zipType = path.extname(gzFile).toLocaleLowerCase()
	let res
	let parms

	if (zipType === '.xz') {
		parms = ['-xf', gzFile, '-C', targetPath, '--strip-components=' + (stripComponents || 1)]
		res = (await execa('tar', parms))
	} else {
		parms = ['-xvzf', gzFile, '-C', targetPath, '--strip-components=' + (stripComponents || 1)]
		res = (await execa('tar', parms))
	}
	if (res.exitCode !== 0) {
		throw new Error(`failed to exec "tar ${parms.join(' ')}"`)
	}
}

Setup.prototype.getExecutable = function (homeDirectory, app, tool, platform) {
	const osys = platform || this.platform()
	const appCode = app.replace(/_/g, '-')
	const f = this.downloadConfig[osys][appCode]
	const toolFilename = this.getFilename(tool)
	const res = f.bin ? path.join(homeDirectory, f.bin) : homeDirectory
	const result = path.join(res, toolFilename)
	return result
}

// eslint-disable-next-line max-params
Setup.prototype.downloadAndUnzip = async function (targetDirectory, tempDirectory, app, setState, platform) {
	const osys = platform || this.platform()
	const appCode = app.replace(/_/g, '-')
	const f = this.downloadConfig[osys][appCode]
	if (!f) {
		throw new Error(`download config ${this.platform()} ${appCode} not found`)
	}

	const fn = this.getFilename(f.url)

	const target = path.join(tempDirectory, fn)

	await this.download(f.url, target, function (e) {
		setState({ action: 'downloading', progress: e.percent })
	})

	setState({ action: 'extracting', progress: 100 })
	const zipType = path.extname(fn).toLocaleLowerCase()
	if (zipType === '.gz' || zipType === '.xz') {
		await this.ungz(target, targetDirectory, f.stripComponents)
	} else {
		this.unzip(target, f.files, targetDirectory)
	}
	return f
}

export default Setup
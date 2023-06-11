import filenamify from 'filenamify'

const os = require('os')
const fs = require('fs')
const fsa = require('fs/promises')
const path = require('path')
const Store = require('electron-store')
const store = new Store()

const Ajv = require("ajv")
const { AggregateAjvError } = require('@segment/ajv-human-errors')


const AdmZip = require("adm-zip")
/* 
	npm install --save filenamify@4.3.0 adm-zip@0.5.10 ajv@8.12.0 file-type@16.5.4
*/
const fileType = require('file-type')
var sizeOf = require('image-size');


const ajv = new Ajv({
	allErrors: true,
	verbose: true
})


const data = {
	foo: 1,
	ba: "abc",
}

function TemplateController() {
	this.schema = {
		type: "object",
		properties: {
			foo: { type: "integer" },
			ba: { type: "string" },
		},
		required: ["foo"],
		additionalProperties: false,
	}

	this.validate = ajv.compile(this.schema)

	return this
}

TemplateController.prototype.getImageDimensions = function (imageFilename) {
	return new Promise(function (resolve, reject) {
		sizeOf(imageFilename, function (err, dimensions) {
			if (err) {
				reject(err)
			} else {
				resolve(dimensions)
			}
		})
	})
}

TemplateController.prototype.verifyDirectoryFile = async function (filename) {
	let type = {
		ext: null,
		mime: null
	}
	if (fs.lstatSync(filename).isFile()) {
		type = await fileType.fromFile(filename)
	}

	const fn = path.basename(filename).toLowerCase()
	console.log(fn)
	switch (fn) {
		case "template.blend":
			if (type.mime !== 'application/x-blender') {
				throw new Error(`${filename} is not a valid Blender file`)
			}
			break;
		case "template.png":
			if (type.mime !== 'image/png') {
				throw new Error(`${filename} is not a valid png file`)
			}
			const dimensions = await this.getImageDimensions(filename)
			if (dimensions.width !== 480 || dimensions.height !== 270) {
				throw new Error(`${filename} has invalid image dimension. Expected was: { width: 480, height: 270, type: 'png' }`)
			}
			break;
		case "template.json":
			const valid = await this.verifyJson(filename)
			if (!valid) {
				throw new Error(this.humanReadbleErrorMessage())
			}
			break;
		default:
			throw new Error(`${filename} is not allowed to be archived. Package/Bundle all resources into template.blend file. In a SSP template archive only template.blend, template.png and template.json can survive.`)
	}
}

TemplateController.prototype.getTemplateDirectoryFiles = function (dir) {
	const files = fs.readdirSync(dir)
	const result = files.filter((f) => path.basename(f).toLowerCase() !== 'template.blend1')
	return result
}

TemplateController.prototype.verifyDirectory = async function (dir) {
	const files = this.getTemplateDirectoryFiles(dir)
	for (let f = 0; f < files.length; f++) {
		const file = path.join(dir, files[f])
		await this.verifyDirectoryFile(file)
	}
	if (files.length !== 3) {
		throw new Error("Missing files in archive: Expecting template.blend, template.png and template.json")
	}
}

TemplateController.prototype.install = async function (zipFilename) {
	// extract to temp overwrite true
	const temp = path.join(os.tmpdir(), path.basename(zipFilename))
	console.log(temp)
	if (fs.existsSync(temp)) {
		const files = fs.readdirSync(temp)
		for (let f = 0; f < files.length; f++) {
			const file = path.join(temp, files[f])
			fs.unlinkSync(file)

		}
		/* fs.rmSync(temp, {
			recursive: true
		}) */
	} else {
		fs.mkdirSync(temp, {
			recursive: true
		})
	}
	const zip = new AdmZip(zipFilename);
	const zipEntries = zip.getEntries(); // an array of ZipEntry records
	zipEntries.forEach(function (zipEntry) {
		const buffer = zipEntry.getData()
		const filename = path.join(temp, path.basename(path.normalize(zipEntry.entryName)))
		fs.writeFileSync(filename, buffer)
	})

	await this.verifyDirectory(temp)

	const templateMeta = JSON.parse(fs.readFileSync(path.join(temp, 'template.json')).toString())
	const username = filenamify(templateMeta.creator || '@n-a')
	const templateName = filenamify(templateMeta.name || 'n-a')
	const targetDirectory = path.join(path.dirname(store.path), 'templates')
	const targetFolder = path.join(targetDirectory, username, templateName)
	if (fs.existsSync(targetFolder)) {
		const r = window.confirm(`Folder "${targetFolder}" already exists. Do you want to overwrite it?`)
		if (!r) {
			throw new Error("Operation canceled by user")
		}
	} else {
		fs.mkdirSync(targetFolder, {
			recursive: true
		})
	}

	zipEntries.forEach(function (zipEntry) {
		const buffer = zipEntry.getData()
		const filename = path.join(targetFolder, path.basename(path.normalize(zipEntry.entryName)))
		fs.writeFileSync(filename, buffer)
	})

	console.log(targetFolder)
}

TemplateController.prototype.exportTemplate = async function (sourceDirectory, targetDirectory) {
	await this.verifyDirectory(sourceDirectory)
	const zip = new AdmZip()
	const files = await this.getTemplateDirectoryFiles(sourceDirectory)
	const templateName = filenamify(path.basename(sourceDirectory))
	const creatorName = filenamify(path.basename(path.join(sourceDirectory, '..')))

	for (let f = 0; f < files.length; f++) {
		const file = files[f]
		const fn = path.join(sourceDirectory, file)
		let buffer = fs.readFileSync(fn)
		if (file.toLowerCase() === 'template.json') {
			const j = JSON.parse(buffer.toString())
			j.creator = creatorName
			j.name = templateName
			buffer = Buffer.from(JSON.stringify(j))
		}
		const zfn = `${creatorName}/${templateName}/${file.toLowerCase()}`
		zip.addFile(zfn, buffer);
	}

	const targetFilename = path.join(targetDirectory, `${creatorName}-${templateName}.zip`)
	console.log(targetFilename)
	zip.writeZip(targetFilename)
}

TemplateController.prototype.humanReadbleErrorMessage = function () {
	let result = "Everything is fine."
	if (!this.valid) {
		const errors = new AggregateAjvError(this.validate.errors)
		result = errors.errors.join('\n')
	}
	return result
}

TemplateController.prototype.verifyJson = function () {
	this.valid = this.validate(data)
	return this.valid
}

export default TemplateController
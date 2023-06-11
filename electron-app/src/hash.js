const crypto = require('crypto');
const fs = require('fs');

function HashValue() {
	return this
}

HashValue.prototype.compute = function (file, customStringValue) {
	const fileBuffer = customStringValue + fs.readFileSync(file).toString();
	const hashSum = crypto.createHash('sha256');
	hashSum.update(fileBuffer);

	const hex = hashSum.digest('hex');
	return hex;
}

module.exports = HashValue

const h = new HashValue()
const hex = h.compute('./hash.js', 'template-1')
console.log(hex)
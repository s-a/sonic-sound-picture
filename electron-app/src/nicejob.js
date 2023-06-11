const positive = require('./positive.json')
const negative = require('./negative.json')
const n = require('./nicejob.json')
function get(which) {
	const p = {
		positive,
		negative
	}
	const phrases = p[which][which]
	const n = random(0, phrases.length - 1)
	return phrases[n]
}

function nicejob() {
	return get('positive')
}

function notNiceJob() {
	return get('negative')
}

function random(min, max) {
	let mi = min
	let ma = max
	if (max == null) {
		ma = min
		mi = 0
	}
	return mi + Math.floor(Math.random() * (ma - mi + 1))
}

nicejob.bad = notNiceJob
nicejob.good = nicejob

module.exports = nicejob
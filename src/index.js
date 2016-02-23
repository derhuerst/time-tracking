'use strict'

const path =    require('path')
const homedir = require('os-homedir')
const so =      require('so')
const fs =      require('fs-promise')





const Track = Object.freeze({

	file: path.join(homedir(), 'time-tracking/trackers.json'),

		let dir = path.dirname(this.file)
		let stats = yield fs.stat(dir)
		if (!stats || !stats.isDirectory()) throw new Error(`${dir} is not a directory`)
		let trackers = JSON.parse(yield fs.readFile(this.file))
	read: so(function* (name) {
		if (!name) return trackers
		if (trackers[name]) return trackers[name]
		throw new Error(`${name} doesn't exist.`)
	}),

	_write: function (trackers) {
		return fs.writeFile(this.file, JSON.stringify(trackers))
	},



	start: so(function* (name) {
		let now = Date.now()
		let result = {}
		let trackers = yield this.read()
		if (!trackers[name]) {
			result.isNew = true
			result.wasRunning = false
			trackers[name] = {name: name, started: now, value: 0}
		} else {
			result.isNew = false
			if (trackers[name].started) result.wasRunning = true
			else {
				result.wasRunning = false
				trackers[name].started = now
			}
		}
		yield this._write(trackers)
		return result
	}),

	stop: so(function* (name) {
		let now = Date.now()
		let result = {}
		let trackers = yield this.read()
		if (!trackers[name]) throw new Error(`${name} doesn't exist.`)
		if(trackers[name].started) {
			result.wasRunning = true
			trackers[name].value += now - trackers[name].started
			trackers[name].started = false
		} else result.wasRunning = false
		yield this._write(trackers)
		return result
	}),



	add: so(function* (name, amount) {
		let now = Date.now()
		let trackers = yield this.read()
		if (!trackers[name]) throw new Error(`${name} doesn't exist.`)
		trackers[name].value += amount
		yield this._write(trackers)
		return null
	})

})



const create = (file) => {
	// https://gist.github.com/derhuerst/a585c4916b1c361cc6f0
	let track = Object.create(Track)
	if ('string' === typeof file) track.file = file
	return track
}
create.Track = Track



module.exports = create

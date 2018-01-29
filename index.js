'use strict'

const path =    require('path')
const os = require('os')
const fs = require('mz/fs')
const mkdirp =  require('mkdirp-then')

const Track = {
	file: path.join(os.homedir(), 'time-tracking/trackers.json'),

	init: async function (name) {
		let dir = path.dirname(this.file), stats
		try { stats = await fs.stat(dir) }
		catch (e) { return await mkdirp(dir) }
		if (!stats || !stats.isDirectory()) throw new Error(`${dir} is not a directory`)
	},

	read: async function (name) {
		await this.init()
		let trackers
		try { trackers = JSON.parse(await fs.readFile(this.file)) }
		catch (e) { trackers = {} }

		if (!name) return trackers
		if (trackers[name]) return trackers[name]
		throw new Error(`${name} doesn't exist.`)
	},

	_write: function (trackers) {
		return fs.writeFile(this.file, JSON.stringify(trackers))
	},

	start: async function (name) {
		let now = Date.now()
		let result = {}
		let trackers = await this.read()
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
		await this._write(trackers)
		return result
	},

	stop: async function (name, apply = true) {
		let now = Date.now()
		let result = {}
		let trackers = await this.read()
		if (!trackers[name]) throw new Error(`${name} doesn't exist.`)
		if(trackers[name].started) {
			result.wasRunning = true
			if (apply) trackers[name].value += now - trackers[name].started
			trackers[name].started = false
		} else result.wasRunning = false
		await this._write(trackers)
		return result
	},

	add: async function (name, amount) {
		let now = Date.now()
		let trackers = await this.read()
		if (!trackers[name]) throw new Error(`${name} doesn't exist.`)
		trackers[name].value += amount
		await this._write(trackers)
		return null
	},

	subtract: function (name, amount) {
		return this.add(name, -amount)
	}
}

const create = (file) => {
	// https://gist.github.com/derhuerst/a585c4916b1c361cc6f0
	let track = Object.create(Track)
	if ('string' === typeof file) track.file = file
	return track
}
create.Track = Track

module.exports = create

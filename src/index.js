'use strict'

const path =    require('path')
const home =    require('os-homedir')()
const Promise = require('bluebird')
const fs =      require('fs-promise')





module.exports = (file) => {
	if (!file) file = path.join(home, 'time-tracking/trackers.json')
	let dir = path.dirname(file)
	let self = {



		read: Promise.coroutine(function* (name) {
			let stats = yield fs.stat(dir)
			if (!stats || !stats.isDirectory()) throw new Error(`${dir} is not a directory`)
			let trackers = JSON.parse(yield fs.readFile(file))
			if (!name) return trackers
			if (trackers[name]) return trackers[name]
			throw new Error(`${name} doesn't exist.`)
		}),



		_write: ((trackers) => fs.writeFile(file, JSON.stringify(trackers))),



		start: Promise.coroutine(function* (name) {
			let now = Date.now()
			let result = {}
			let trackers = yield self.read()
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
			yield self._write(trackers)
			return result
		}),



		stop: Promise.coroutine(function* (name) {
			let now = Date.now()
			let result = {}
			let trackers = yield self.read()
			if (!trackers[name]) throw new Error(`${name} doesn't exist.`)
			if(trackers[name].started) {
				result.wasRunning = true
				trackers[name].value += now - trackers[name].started
				trackers[name].started = false
			} else result.wasRunning = false
			yield self._write(trackers)
			return result
		}),



		add: Promise.coroutine(function* (name, amount) {
			debugger
			let now = Date.now()
			let trackers = yield self.read()
			if (!trackers[name]) throw new Error(`${name} doesn't exist.`)
			trackers[name].value += amount
			console.log('trackers', trackers)
			yield self._write(trackers)
			return null
		})



	}
	return self
}

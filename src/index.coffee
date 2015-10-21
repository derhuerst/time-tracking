path =			require 'path'
home =			require('os-homedir')()
fs =			require 'fs-promise'
Promise =		require 'bluebird'





module.exports =



	file:	path.join home, 'time-tracking', 'trackers.json'



	read: () ->
		file = @file
		dir = path.dirname file
		return new Promise (resolve, reject) ->
			fs.stat dir
			.catch () -> fs.mkdir dir
			.catch reject
			.then (stats) ->
				if not stats.isDirectory()
					reject new Error "#{dir} is not a directory"
				else return fs.readFile file
			.catch reject
			.then (content) -> resolve JSON.parse content



	_write: (trackers) ->
		file = @file
		dir = path.dirname file
		return new Promise (resolve, reject) ->
			fs.writeFile file, JSON.stringify trackers
			.catch reject
			.then () -> resolve true



	start: (tracker) ->
		now = Date.now()
		result = {}
		return @read()
		.then (trackers) ->
			if trackers[tracker]
				result.isNew = false
				if trackers[tracker].started
					result.wasRunning = true
				else
					result.wasRunning = false
					trackers[tracker].started = now
			else
				result.isNew = true
				result.wasRunning = false
				trackers[tracker] =
					name:		tracker
					started:	now
					value:		0
			return trackers
		.then @_write
		.then () -> return result



	stop: (tracker) ->
		now = Date.now()
		result = {}
		return @read()
		.then (trackers) ->
			if not trackers[tracker]
				return new Error "#{tracker} doesn't exist."
			if trackers[tracker].started
				result.wasRunning = true
				trackers[tracker].value += now - trackers[tracker].started
				trackers[tracker].started = false
			else result.wasRunning = false
			return trackers
		.then @_write
		.then () -> return result



	add: (tracker, amount) ->
		now = Date.now()
		return @read()
		.then (trackers) ->
			if not trackers[tracker]
				return new Error "#{tracker} doesn't exist."
			trackers[tracker].value += amount
			return trackers
		.then @_write
		.then () -> return null

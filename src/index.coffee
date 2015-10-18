path =			require 'path'
home =			require('os-homedir')()
fs =			require 'fs-promise'





module.exports =



	file:	path.join home, 'time-tracking', 'trackers.json'



	_read: (cb = ()->) ->
		file = @file
		dir = path.dirname file
		fs.stat @dir
		.catch () -> fs.mkdir dir
		.catch (err) ->
			process.stderr.write err.message
			process.exit 1
		.then (stats) ->
			if not stats.isDirectory()
				process.stderr.write "#{dir} is not a directory"
				process.exit 1
			else return fs.readFile file
		.catch cb
		.then (content) -> cb null, JSON.parse content



	_write: (cb = ()->) ->
		# todo

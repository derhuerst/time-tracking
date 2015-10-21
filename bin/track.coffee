yargs =			require 'yargs'
chalk =			require 'chalk'
lPad =			require 'left-pad'
rPad =			require 'right-pad'
ms =			require 'ms'

track =			require '../src/index'





figures =
	started:	chalk.green '\u25b6'
	stopped:	chalk.red '\u25a0'
	error:		chalk.red '!'



showError = (err) ->
	process.stderr.write [
		figures.error
		err.message
	].join(' ') + '\n'



help = [
	chalk.yellow 'track start <name>'
	chalk.yellow 'track - <name>'
	'  Start a new or resume an existing tracker. `name` must be a valid JSON key.'
	chalk.yellow 'track stop <name>'
	chalk.yellow 'track . <name>'
	'  Stop an existing tracker.'
	''
	chalk.yellow 'track add <name> <amount>'
	chalk.yellow 'track + <name> <amount>'
	'  Add any amount of time to an existing tracker.'
	chalk.yellow 'track subtract <name> <amount>'
	chalk.yellow 'track - <name> <amount>'
	'  Subtract any amount of time from an existing tracker.'
	''
	chalk.yellow 'track status <name>'
	chalk.yellow 'track s <name>'
	'  Show the status of a tracker.'
	chalk.yellow 'track status'
	chalk.yellow 'track s'
	'  Show the status of all active trackers.'
	''
	chalk.yellow 'Options:'
	'  -s, --silent		No output'
	'  -p, --porcelain	Machine-readable output.'
].join('\n') + '\n'





start = (name, options = {}) ->
	if not name
		process.stderr.write 'Missing `name` argument.'
		return process.exit 1

	track.start(name).then (ctx) ->
		return if options.silent

		process.stdout.write [
			figures.started
			chalk.underline name
			chalk.gray
				if ctx.isNew then 'started'
				else
					if ctx.wasRunning then 'already running'
					else 'resumed'
		].join(' ') + '\n'





stop = (name, options = {}) ->
	if not name
		process.stderr.write 'Missing `name` argument.'
		return process.exit 1

	track.stop(name)
	.catch showError
	.then (ctx) ->
		return if options.silent

		process.stdout.write [
			figures.stopped
			chalk.underline name
			chalk.gray 'stopped'
		].join(' ') + '\n'





add = (name, amount, options = {}) ->
	if not name
		process.stderr.write 'Missing `name` argument.'
		return process.exit 1
	if not amount
		process.stderr.write 'Missing `amount` argument.'
		return process.exit 1

	amount = ms amount
	track.add(name, amount)
	.catch showError
	.then (ctx) ->
		return if options.silent

		process.stdout.write [
			chalk.gray 'added'
			ms amount
			chalk.gray 'to'
			chalk.underline name
		].join(' ') + '\n'





subtract = (name, amount, options = {}) ->
	if not name
		process.stderr.write 'Missing `name` argument.'
		return process.exit 1
	if not amount
		process.stderr.write 'Missing `amount` argument.'
		return process.exit 1

	amount = ms amount
	track.subtract(name, amount)
	.catch showError
	.then (ctx) ->
		return if options.silent

		process.stdout.write [
			chalk.gray 'subtracted'
			ms amount
			chalk.gray 'from'
			chalk.underline name
		].join(' ') + '\n'





singleStatus = (task) ->
	elapsed = if tracker.started then Date.now() - tracker.started else 0
	output = [
		lPad chalk.underline(task.name), 25
		rPad chalk.cyan(ms tracker.value + elapsed), 15
	]
	if tracker.started then output.push figures.started, ms elapsed
	return output.join ''



status = (name, options = {}) ->
	track.read name
	.catch showError
	.then (tasks) ->
		return if options.silent

		count = 0
		for name, task of tasks
			count++
			process.stdout.write singleStatus(task) + '\n'
		if count is 0 then process.stdout.write chalk.gray 'no trackers\n'
	.catch showError







argv = yargs.argv
options =
	silent:		argv.silent or argv.s or false
	porcelain:	argv.porcelain or argv.p or false

switch argv._[0]
	when 'start', '-' then start argv._[1], options
	when 'stop', '.' then start argv._[1], options
	when 'add', '+' then add argv._[1], argv._[2], options
	when 'subtract', '-' then subtract argv._[1], argv._[2], options
	when 'status', 's' then status argv._[1], options
	else
		if argv.help or argv.h then process.stdout.write help
		else process.stderr.write 'invalid command\n'

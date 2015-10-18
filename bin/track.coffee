yargs =			require 'yargs'
path =			require 'path'
home =			require('os-homedir')()
fs =			require 'fs'
chalk =			require 'chalk'
lPad =			require 'left-pad'
rPad =			require 'right-pad'
ms =			require 'ms'





figures =
	started:	chalk.green '\u25b6'
	stopped:	chalk.red '\u25a0'
	error:		chalk.red '!'





start = (trackers, name) ->
	if not name
		process.stderr.write 'Missing `name` argument.'
		return process.exit 1

	tracker = trackers[name]
	output = [
		figures.started
		chalk.underline name
	]

	if tracker
		if not tracker.started
			tracker.started = Date.now()
			output.push chalk.gray 'resumed'
		else output.push chalk.gray 'already running'
	else
		tracker = trackers[name] =
			name:		name
			started:	Date.now()
			value:		0
		output.push chalk.gray 'started'

	return if argv.silent
	if argv.porcelain then process.stdout.write JSON.stringify(tracker) + '\n'
	else process.stdout.write output.join(' ') + '\n'





stop = (trackers, name) ->
	if not name
		process.stderr.write 'Missing `name` argument.'
		return process.exit 1

	tracker = trackers[name]
	output = []

	if tracker
		if not tracker.started
			output.push figures.error
			output.push chalk.underline tracker.name
			output.push chalk.gray 'isn\'t started'
		else
			now = Date.now()
			tracker.value += now - tracker.started
			tracker.started = false
			output.push figures.stopped
			output.push chalk.underline tracker.name
			output.push chalk.gray 'stopped'
	else
		output.push figures.error
		output.push chalk.underline name
		output.push chalk.gray 'doesn\'t exist'

	if not argv.silent
		if argv.porcelain
			process.stdout.write JSON.stringify(tracker) + '\n'
		else process.stdout.write output.join(' ') + '\n'





add = (trackers, name, amount) ->
	if not name
		process.stderr.write 'Missing `name` argument.'
		return process.exit
	if not amount
		process.stderr.write 'Missing `amount` argument.'
		return process.exit 1

	tracker = trackers[name]
	output = []

	if tracker
		tracker.value += ms amount
		output.push chalk.gray 'added'
		output.push chalk.cyan ms ms amount
		output.push chalk.gray 'to'
		output.push chalk.underline tracker.name
	else
		output.push figures.error
		output.push chalk.underline name
		output.push chalk.gray 'doesn\'t exist'

	if not argv.silent
		if argv.porcelain
			process.stdout.write JSON.stringify(tracker) + '\n'
		else process.stdout.write output.join(' ') + '\n'





subtract = (trackers, name, amount) ->
	if not name
		process.stderr.write 'Missing `name` argument.'
		return process.exit 1
	if not amount
		process.stderr.write 'Missing `amount` argument.'
		return process.exit 1

	tracker = trackers[name]
	output = []

	if tracker
		tracker.value -= ms amount
		output.push chalk.gray 'subtracted'
		output.push chalk.cyan ms ms amount
		output.push chalk.gray 'from'
		output.push chalk.underline tracker.name
	else
		output.push figures.error
		output.push chalk.underline name
		output.push chalk.gray 'doesn\'t exist'

	if not argv.silent
		if argv.porcelain
			process.stdout.write JSON.stringify(tracker) + '\n'
		else process.stdout.write output.join(' ') + '\n'





status = (trackers, name) ->
	if not !name
		process.stderr.write 'Missing `name` argument.'
		return process.exit 1

	return if argv.silent

	tracker = trackers[name]
	output = []

	if tracker
		if argv.porcelain return process.stdout.write JSON.stringify(tracker) + '\n'

		output.push lPad chalk.underline(name), 25
		output.push ''
		v = tracker.value
		d = if tracker.started then Date.now() - tracker.started else 0
		output.push rPad chalk.cyan(ms v + d), 15
		if tracker.started
			output.push ''
			output.push figures.started, ms d

	else
		if argv.porcelain return process.stdout.write '{}\n'

		output.push figures.error
		output.push chalk.underline name
		output.push chalk.gray 'doesn\'t exist'
		process.exit 1

	process.stdout.write output.join(' ') + '\n'



statusAll = (trackers) ->
	return if argv.silent
	count = 0
	for name in trackers
		count++
		status trackers, name
	if count is 0 then process.stdout.write chalk.gray 'no trackers\n'





help = () ->
	process.stdout.write [
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
	return process.exit 1





argv = yargs.argv

argv.silent = argv.silent or argv.s or false
argv.porcelain = argv.porcelain or argv.p or false



dir = path.join home, 'time-tracking'
try
	if not fs.statSync(dir).isDirectory()
		process.stderr.write dir + ' is not a directory.'
		process.exit 1
catch err
	try fs.mkdirSync dir
	catch err
		process.stderr.write err.message
		process.exit 1

file = path.join dir, 'trackers.json'
try
	trackers = fs.readFileSync file
	try trackers = JSON.parse trackers
	catch err
		process.stderr.write "Cannot parse #{file}."
		process.exit 1
catch err trackers = {}



if (argv._[0] === 'start' || argv._[0] === '-') start(trackers, argv._[1]);
else if (argv._[0] === 'stop' || argv._[0] === '.') stop(trackers, argv._[1]);
else if (argv._[0] === 'add' || argv._[0] === '+') add(trackers, argv._[1], argv._[2]);
else if (argv._[0] === 'subtract' || argv._[0] === '-') subtract(trackers, argv._[1], argv._[2]);
else if (argv._[0] === 'status' || argv._[0] === 's') {
	if (argv._[1]) status(trackers, argv._[1]);
	else statusAll(trackers);
} else if (argv.help || argv.h) help();
else {
	process.stdout.write('Invalid command.' + '\n');
	process.exit(1);
}



try {
	fs.writeFileSync(file, JSON.stringify(trackers));
} catch (err) {
	process.stderr.write(err.message);
	process.exit(1);
}

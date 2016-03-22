#!/usr/bin/env node
'use strict'

const chalk =   require('chalk')
const figures = require('figures')
const lPad =    require('left-pad')
const rPad =    require('right-pad')
const ms =      require('ms')
const yargs =   require('yargs')
const so =      require('so')

const track =   require('../src/index')()





const symbols = {
	started:  chalk.green(figures.play),
	stopped:  chalk.red(figures.squareSmallFilled),
	error:    chalk.red('!')
}

const showError = (err) => process.stderr.write([
	symbols.error, err.message
].join(' ') + '\n')



const start = so(function* (name, options) {
	if (!options) options = {}
	if (!name) {
		process.stderr.write('Missing `name` argument.')
		return process.exit(1)
	}

	let result
	try { result = yield track.start(name) }
	catch (err) { return showError(err) }
	if (options.silent) return

	process.stdout.write([
		symbols.started,
		chalk.underline(name),
		chalk.gray(result.isNew ? 'started' :
			(result.wasRunning ? 'already running' : 'resumed')
		)
	].join(' ') + '\n')
})



const stop = so(function* (name, options) {
	if (!options) options = {}
	if (!name) {
		process.stderr.write('Missing `name` argument.')
		return process.exit(1)
	}

	let result
	try { result = track.stop(name) }
	catch (err) { return showError(err) }
	if (options.silent) return

	process.stdout.write([
		symbols.stopped,
		chalk.underline(name),
		chalk.gray('stopped')
	].join(' ') + '\n')
})



const add = so(function* (name, amount, options) {
	if (!options) options = {}
	if (!name) {
		process.stderr.write('Missing `name` argument.')
		return process.exit(1)
	}
	if (!amount) {
		process.stderr.write('Missing `amount` argument.')
		return process.exit(1)
	}
	amount = ms(amount)

	let result
	try { result = yield track.add(name, amount) }
	catch (err) { return showError(err) }
	if (options.silent) return

	process.stdout.write([
		chalk.gray('added'),
		ms(amount),
		chalk.gray('to'),
		chalk.underline(name)
	].join(' ') + '\n')
})



const subtract = so(function* (name, amount, options) {
	if (!options) options = {}
	if (!name) {
		process.stderr.write('Missing `name` argument.')
		return process.exit(1)
	}
	if (!amount) {
		process.stderr.write('Missing `amount` argument.')
		return process.exit(1)
	}

	amount = ms(amount)
	let result
	try { result = yield track.subtract(name, amount) }
	catch (err) { return showError(err) }
	if (options.silent) return

	process.stdout.write([
		chalk.gray('subtracted'),
		ms(amount),
		chalk.gray('from'),
		chalk.underline(name)
	].join(' ') + '\n')
})



const statusOfTracker = (tracker) => {
	let elapsed = tracker.started ? Date.now() - tracker.started : 0
	let output = [
		lPad(chalk.underline(tracker.name), 25),
		rPad(chalk.cyan(ms(tracker.value + elapsed)), 15)
	]
	if (tracker.started) output.push(symbols.started, ms(elapsed))
	return output.join(' ')
}

const status = so(function* (name, options) {
	if (!options) options = {}
	let trackers
	try { trackers = yield track.read(name) }
	catch (err) { return showError(err) }
	if (options.silent) return

	if (name) process.stdout.write(statusOfTracker(trackers) + '\n')
	else if (Object.keys(trackers).length === 0)
		process.stdout.write(chalk.gray('no trackers\n'))
	else process.stdout.write(Object.keys(trackers)
		.map((name) => statusOfTracker(trackers[name]))
		.join('\n') + '\n')
})



const help = [
	chalk.yellow('track start <name>'),
	chalk.yellow('track 1 <name>'),
	'  Start a new or resume an existing tracker. `name` must be a valid JSON key.',
	chalk.yellow('track stop <name>'),
	chalk.yellow('track 0 <name>'),
	'  Stop an existing tracker.',
	'',
	chalk.yellow('track add <name> <amount>'),
	chalk.yellow('track + <name> <amount>'),
	'  Add any amount of time to an existing tracker.',
	chalk.yellow('track subtract <name> <amount>'),
	chalk.yellow('track - <name> <amount>'),
	'  Subtract any amount of time from an existing tracker.',
	'',
	chalk.yellow('track status <name>'),
	chalk.yellow('track s <name>'),
	'  Show the status of a tracker.',
	chalk.yellow('track status'),
	chalk.yellow('track s'),
	'  Show the status of all active trackers.',
	'',
	chalk.yellow('Options:'),
	'  -s, --silent     No output',
	'  -p, --porcelain  Machine-readable output.'
].join('\n') + '\n'

const argv = yargs.argv
const options = {
	silent:    argv.silent || argv.s || false,
	porcelain: argv.porcelain || argv.p || false
}

switch (argv._[0]) {
	case 'start':
	case 1:
		start(argv._[1], options)
		break
	case 'stop':
	case 0:
		stop(argv._[1], options)
		break
	case 'add':
	case '+':
		add(argv._[1], argv._[2], options)
		break
	case 'subtract':
	case '-':
		subtract(argv._[1], argv._[2], options)
		break
	case 'status':
	case 's':
		status(argv._[1], options)
		break
	default:
		if (argv.help || argv.h) process.stdout.write(help)
		else process.stderr.write('invalid command\n')
		break
}
// end

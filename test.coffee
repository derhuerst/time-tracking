'use strict'

path =           require 'path'
fs =             require 'fs'
so =             require 'so'
isRoughlyEqual = require 'is-roughly-equal'
assert =         require 'assert'


track = require './src/index.js'



tmp = path.join __dirname, 'tmp.json'
equalBy500 = isRoughlyEqual 500

module.exports =

	tearDown: (cb) -> fs.stat tmp, (err) ->
		if not err then fs.unlink tmp, cb
		else cb()

	'kitchen sink': (t) ->
		t.expect 8
		tr = track tmp
		so(->

			trackers = yield tr.read()
			t.strictEqual Object.keys(trackers).length, 0

			# creating by starting a tracker
			yield tr.start 'foo'
			yield tr.start 'foo' # twice to check for idempotence
			trackers = yield tr.read()
			t.strictEqual typeof trackers.foo,    'object'
			t.strictEqual trackers.foo.name,      'foo'
			t.strictEqual trackers.foo.value,     0
			t.ok equalBy500 trackers.foo.started, Date.now()

			# stopping a tracker
			yield tr.stop 'foo'
			trackers = yield tr.read()
			t.strictEqual trackers.foo.started, false

			# starting an existing tracker
			yield tr.start 'foo'
			trackers = yield tr.read()
			t.ok equalBy500 trackers.foo.started, Date.now()
			yield tr.stop 'foo'

			# adding to existing tracker
			before = (yield tr.read()).foo.value
			yield tr.add 'foo', 500
			after = (yield tr.read()).foo.value
			t.strictEqual after, before + 500

		)()
		.catch (err) -> console.error(err.stack)
		.then -> t.done()

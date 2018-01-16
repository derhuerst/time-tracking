'use strict'

const test = require('tape')
const path = require('path')
const os = require('os')
const shortid = require('shortid')
const isRoughlyEqual = require('is-roughly-equal')

const track = require('.')

const tmp = () => path.join(os.tmpdir(), shortid.generate() + '.json')
const equalBy500 = isRoughlyEqual(500)

test('kitchen sink', async (t) => {
	t.plan(9)
	const tr = track(tmp())

	const trackers1 = await tr.read()
	t.equal(Object.keys(trackers1).length, 0)

	// creating by starting a tracker
	await tr.start('foo')
	await tr.start('foo') // twice to check for idempotence
	const trackers2 = await tr.read()
	t.equal(typeof trackers2.foo, 'object')
	t.equal(trackers2.foo.name, 'foo')
	t.equal(trackers2.foo.value, 0)
	t.ok(equalBy500(trackers2.foo.started, Date.now()))

	// stopping a tracker
	const oldFoo1 = (await tr.read()).foo.value
	await tr.start('foo')
	await tr.stop('foo')
	const newFoo1 = (await tr.read()).foo.value
	t.notStrictEqual(oldFoo1, newFoo1)

	// aborting a tracker
	const oldFoo2 = (await tr.read()).foo.value
	await tr.start('foo')
	await tr.stop('foo', false)
	const newFoo2 = (await tr.read()).foo.value
	t.equal(oldFoo2, newFoo2)

	// starting an existing tracker
	await tr.start('foo')
	const trackers3 = await tr.read()
	t.ok(equalBy500(trackers3.foo.started, Date.now()))
	await tr.stop('foo')

	// adding to existing tracker
	const oldFoo3 = (await tr.read()).foo.value
	await tr.add('foo', 500)
	const newFoo3 = (await tr.read()).foo.value
	t.equal(newFoo3, oldFoo3 + 500)
})

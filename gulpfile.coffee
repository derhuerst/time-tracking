gulp		= require 'gulp'
gutil		= require 'gulp-util'

coffee		= require 'gulp-coffee'
header		= require 'gulp-header'
chmod		= require 'gulp-chmod'
del			= require 'del'


# package metadata
pkg = require './package.json'





gulp.task 'bin', () ->

	compiler = coffee bare: true
	compiler.on 'error', gutil.log

	gulp.src './bin/track.coffee'
		.pipe compiler
		.pipe header [
			'#!env node'   # shebang
			"// #{pkg.name} #{pkg.version}"
			''
		].join '\n'
        .pipe chmod 755   # make executable
		.pipe gulp.dest './bin'




gulp.task 'src', () ->

	compiler = coffee bare: true
	compiler.on 'error', gutil.log

	gulp.src './src/*.coffee'
		.pipe compiler
		.pipe gulp.dest './src'




gulp.task 'clean', () ->
	del [
		'bin/track.js'
		'src/*.js'
	]




gulp.task 'default', ['bin', 'src'], ->

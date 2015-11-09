gulp		= require 'gulp'
gutil		= require 'gulp-util'

coffee		= require 'gulp-coffee'
header		= require 'gulp-header'


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
		.pipe gulp.dest './bin'




gulp.task 'src', () ->

	compiler = coffee bare: true
	compiler.on 'error', gutil.log

	gulp.src './src/*.coffee'
		.pipe compiler
		.pipe gulp.dest './src'




gulp.task 'default', ['bin', 'src'], ->

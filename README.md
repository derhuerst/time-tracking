# *time-tracking*

Command line time tracking.

[![npm version](https://img.shields.io/npm/v/time-tracking.svg)](https://www.npmjs.com/package/time-tracking)
[![dependency status](https://img.shields.io/david/derhuerst/time-tracking.svg)](https://david-dm.org/derhuerst/time-tracking)



## Installing

```shell
npm install -g time-tracking
```



## Usage

```
Usage:
	track <start|stop> <name>
	track status [name]

start <name>
	Start a new or resume an existing tracker.
	`name` must be a valid JSON key.
stop <name>
	Stop an existing tracker.
	The tracked session will be put into history.

status
	Show the status of a tracker.
status [name]
	Show the status of all active trackers.

Options:
	-s, --silent		No output
	-p, --porcelain		Machine-readable output.
```



## Contributing

If you **have a question**, **found a bug** or want to **propose a feature**, have a look at [the issues page](https://github.com/derhuerst/time-tracking/issues).


#!env node
// time-tracking 0.2.0
var add, argv, chalk, figures, help, lPad, ms, options, rPad, showError, singleStatus, start, status, stop, subtract, track, yargs;

yargs = require('yargs');

chalk = require('chalk');

lPad = require('left-pad');

rPad = require('right-pad');

ms = require('ms');

track = require('../src/index');

figures = {
  started: chalk.green('\u25b6'),
  stopped: chalk.red('\u25a0'),
  error: chalk.red('!')
};

showError = function(err) {
  return process.stderr.write([figures.error, err.message].join(' ') + '\n');
};

help = [chalk.yellow('track start <name>'), chalk.yellow('track - <name>'), '  Start a new or resume an existing tracker. `name` must be a valid JSON key.', chalk.yellow('track stop <name>'), chalk.yellow('track . <name>'), '  Stop an existing tracker.', '', chalk.yellow('track add <name> <amount>'), chalk.yellow('track + <name> <amount>'), '  Add any amount of time to an existing tracker.', chalk.yellow('track subtract <name> <amount>'), chalk.yellow('track - <name> <amount>'), '  Subtract any amount of time from an existing tracker.', '', chalk.yellow('track status <name>'), chalk.yellow('track s <name>'), '  Show the status of a tracker.', chalk.yellow('track status'), chalk.yellow('track s'), '  Show the status of all active trackers.', '', chalk.yellow('Options:'), '  -s, --silent		No output', '  -p, --porcelain	Machine-readable output.'].join('\n') + '\n';

start = function(name, options) {
  if (options == null) {
    options = {};
  }
  if (!name) {
    process.stderr.write('Missing `name` argument.');
    return process.exit(1);
  }
  return track.start(name).then(function(ctx) {
    if (options.silent) {
      return;
    }
    return process.stdout.write([figures.started, chalk.underline(name), chalk.gray, ctx.isNew ? 'started' : ctx.wasRunning ? 'already running' : 'resumed'].join(' ') + '\n');
  });
};

stop = function(name, options) {
  if (options == null) {
    options = {};
  }
  if (!name) {
    process.stderr.write('Missing `name` argument.');
    return process.exit(1);
  }
  return track.stop(name)["catch"](showError).then(function(ctx) {
    if (options.silent) {
      return;
    }
    return process.stdout.write([figures.stopped, chalk.underline(name), chalk.gray('stopped')].join(' ') + '\n');
  });
};

add = function(name, amount, options) {
  if (options == null) {
    options = {};
  }
  if (!name) {
    process.stderr.write('Missing `name` argument.');
    return process.exit(1);
  }
  if (!amount) {
    process.stderr.write('Missing `amount` argument.');
    return process.exit(1);
  }
  amount = ms(amount);
  return track.add(name, amount)["catch"](showError).then(function(ctx) {
    if (options.silent) {
      return;
    }
    return process.stdout.write([chalk.gray('added'), ms(amount), chalk.gray('to'), chalk.underline(name)].join(' ') + '\n');
  });
};

subtract = function(name, amount, options) {
  if (options == null) {
    options = {};
  }
  if (!name) {
    process.stderr.write('Missing `name` argument.');
    return process.exit(1);
  }
  if (!amount) {
    process.stderr.write('Missing `amount` argument.');
    return process.exit(1);
  }
  amount = ms(amount);
  return track.subtract(name, amount)["catch"](showError).then(function(ctx) {
    if (options.silent) {
      return;
    }
    return process.stdout.write([chalk.gray('subtracted'), ms(amount), chalk.gray('from'), chalk.underline(name)].join(' ') + '\n');
  });
};

singleStatus = function(task) {
  var elapsed, output;
  elapsed = tracker.started ? Date.now() - tracker.started : 0;
  output = [lPad(chalk.underline(task.name), 25), rPad(chalk.cyan(ms(tracker.value + elapsed)), 15)];
  if (tracker.started) {
    output.push(figures.started, ms(elapsed));
  }
  return output.join('');
};

status = function(name, options) {
  if (options == null) {
    options = {};
  }
  return track.read(name)["catch"](showError).then(function(tasks) {
    var count, task;
    if (options.silent) {
      return;
    }
    count = 0;
    for (name in tasks) {
      task = tasks[name];
      count++;
      process.stdout.write(singleStatus(task) + '\n');
    }
    if (count === 0) {
      return process.stdout.write(chalk.gray('no trackers\n'));
    }
  })["catch"](showError);
};

argv = yargs.argv;

options = {
  silent: argv.silent || argv.s || false,
  porcelain: argv.porcelain || argv.p || false
};

switch (argv._[0]) {
  case 'start':
  case '-':
    start(argv._[1], options);
    break;
  case 'stop':
  case '.':
    start(argv._[1], options);
    break;
  case 'add':
  case '+':
    add(argv._[1], argv._[2], options);
    break;
  case 'subtract':
  case '-':
    subtract(argv._[1], argv._[2], options);
    break;
  case 'status':
  case 's':
    status(argv._[1], options);
    break;
  default:
    if (argv.help || argv.h) {
      process.stdout.write(help);
    } else {
      process.stderr.write('invalid command\n');
    }
}

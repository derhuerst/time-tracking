var Promise, fs, home, path;

path = require('path');

home = require('os-homedir')();

fs = require('fs-promise');

Promise = require('bluebird');

module.exports = {
  file: path.join(home, 'time-tracking', 'trackers.json'),
  read: function(tracker) {
    var dir, file;
    file = this.file;
    dir = path.dirname(file);
    return new Promise(function(resolve, reject) {
      return fs.stat(dir)["catch"](function() {
        return fs.mkdir(dir);
      })["catch"](reject).then(function(stats) {
        if (!stats.isDirectory()) {
          return reject(new Error(dir + " is not a directory"));
        } else {
          return fs.readFile(file);
        }
      })["catch"](reject).then(function(trackers) {
        trackers = JSON.parse(trackers);
        if (tracker) {
          if (!trackers[tracker]) {
            return reject(new Error(tracker + " doesn't exist."));
          } else {
            return resolve(trackers[tracker]);
          }
        } else {
          return resolve(trackers);
        }
      });
    });
  },
  _write: function(trackers) {
    var dir, file;
    file = this.file;
    dir = path.dirname(file);
    return new Promise(function(resolve, reject) {
      return fs.writeFile(file, JSON.stringify(trackers))["catch"](reject).then(function() {
        return resolve(true);
      });
    });
  },
  start: function(tracker) {
    var now, result;
    now = Date.now();
    result = {};
    return this.read().then(function(trackers) {
      if (trackers[tracker]) {
        result.isNew = false;
        if (trackers[tracker].started) {
          result.wasRunning = true;
        } else {
          result.wasRunning = false;
          trackers[tracker].started = now;
        }
      } else {
        result.isNew = true;
        result.wasRunning = false;
        trackers[tracker] = {
          name: tracker,
          started: now,
          value: 0
        };
      }
      return trackers;
    }).then(this._write).then(function() {
      return result;
    });
  },
  stop: function(tracker) {
    var now, result;
    now = Date.now();
    result = {};
    return this.read().then(function(trackers) {
      if (!trackers[tracker]) {
        return new Error(tracker + " doesn't exist.");
      }
      if (trackers[tracker].started) {
        result.wasRunning = true;
        trackers[tracker].value += now - trackers[tracker].started;
        trackers[tracker].started = false;
      } else {
        result.wasRunning = false;
      }
      return trackers;
    }).then(this._write).then(function() {
      return result;
    });
  },
  add: function(tracker, amount) {
    var now;
    now = Date.now();
    return this.read().then(function(trackers) {
      if (!trackers[tracker]) {
        return new Error(tracker + " doesn't exist.");
      }
      trackers[tracker].value += amount;
      return trackers;
    }).then(this._write).then(function() {
      return null;
    });
  }
};

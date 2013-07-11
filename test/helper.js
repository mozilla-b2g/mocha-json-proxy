var exec = require('child_process').exec,
    EE = require('events').EventEmitter,
    debug = require('debug')('mocha-json-proxy:test');

function runFixture(test, callback) {
  var cmd =
    __dirname + '/../node_modules/.bin/mocha' +
    ' --ui tdd --reporter ' + __dirname + '/../reporter ' +
    __dirname + '/fixtures/' + test;

  var emitter = new EE();
  exec(cmd, function(err, stdout, stderr) {
    debug('stdout', stdout);
    if (stderr)
      console.error('ERR>>', stderr);

    callback(null, emitter);

    var out = stdout.trim().split('\n');
    out.forEach(function(line) {
      var json;
      try {
        json = JSON.parse(line);
      } catch (e) {
        console.error(e);
      }
      emitter.emit.apply(emitter, json);
    });
    emitter.emit('helper end');
  });
}

global.assert = require('assert');
global.runFixture = runFixture;

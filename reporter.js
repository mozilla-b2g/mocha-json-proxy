var EVENTS = [
  'pending',
  'pass',
  'fail',
  'test',
  'test end',
  'suite',
  'suite end',
  'start',
  'end'
];

var ALLOWED_OBJECTS = ['err'];

function write(event, content) {
  var args = Array.prototype.slice.call(arguments);

  if (!process.env[Reporter.FORK_ENV]) {
    process.stdout.write(JSON.stringify(args) + '\n');
    return;
  }

  process.send(['mocha-proxy', args]);
}

function cloneValue(value) {
  switch (typeof value) {
    case 'object':
      return cloneTestObject(value);
    case 'function':
      return value.toString();
  }

  return value;
}

function cloneTestObject(object) {
  var keys = Object.keys(object),
      result = {};

  for (var i = 0, len = keys.length; i < len; i++) {
    var key = keys[i];
    var value = object[key];

    // don't copy objects recursively
    if (typeof value === 'object' && ALLOWED_OBJECTS.indexOf(key) === -1)
      continue;

    result[key] = cloneValue(value);
  }

  return result;
}

function cloneError(err) {
  var result = {
    name: err.name || '',
    stack: err.stack,
    type: err.type || 'Error',
    constructorName: err.constructorName || 'Error',
    expected: err.expected || null,
    actual: err.actual || null
  };

  if (err && 'uncaught' in err)
    result.uncaught = err.uncaught;

  return result;
}

function defaultHandler(type, runner, payload) {
  return write(type, cloneValue(payload));
}


/**
 * Static object responsible for converting each event type.
 */
var EventHandler = {
  fail: function(event, runner, payload, err) {
    write(event, cloneValue(payload), cloneError(err));
  }
};

function Reporter(runner) {
  EVENTS.forEach(function(event) {
    var handler = EventHandler[event] || defaultHandler;
    runner.on(event, handler.bind(this, event, runner));
  }, this);
}

Reporter.FORK_ENV = 'MOCHA_PROXY_SEND_ONLY';

module.exports = Reporter;

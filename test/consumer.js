suite('consumer', function() {
  var child;
  var Consumer = require('../consumer');
  var subject;
  var mocha = require('mocha');

  var EVENTS = [
    'start',
    'pass',
    'test',
    'test end',
    'suite',
    'suite end',
    'end'
  ];

  var emitted;

  setup(function(done) {
    emitted = {};
    child = forkFixture('pass');
    subject = new Consumer(child);

    EVENTS.forEach(function(event) {
      emitted = {};
      subject.on(event, function() {
        if (!emitted[event])
          emitted[event] = [];

        emitted[event].push(Array.prototype.slice.call(arguments));
      });
    });

    subject.once('end', done);
  });

  function emitsRunnable(event) {
    if (typeof event === 'string') {
      return emitted[event].forEach(emitsRunnable);
    }

    assert.ok(typeof event[0].slow === 'function', 'has .slow');
    assert.equal(event[0].slow(), event[0]._slow);
  }

  suite('suite', function() {
    test('is runnable', function() {
      emitsRunnable('suite');
    });

    test('child suite should have reference to parent', function() {
      var parent = emitted.suite[0][0];
      var child = emitted.suite[1][0];

      assert.ok(!parent.parent, 'root suite has no parent');
      assert.strictEqual(child.parent, parent, 'references parent');
    });
  });

  test('suite end', function() {
    emitsRunnable('suite end');
  });

  test('test', function() {
    emitsRunnable('test');
  });

  test('pass', function() {
    emitsRunnable('pass');
  });

  test('test end', function() {
    emitsRunnable('test end');
  });

  suite('objects with ._ids are the same', function() {
    var tests;
    var suites;

    function group(events, target) {
      events.forEach(function(event) {
        emitted[event].forEach(function(items) {
          items.forEach(function(item) {
            if (!target[item.title])
              target[item.title] = [];

            target[item.title].push(item);
          });
        });
      });
    }

    setup(function() {
      tests = {};
      suites = {};

      group(['test', 'pass', 'test end'], tests);
      group(['suite', 'suite end'], suites);
    });

    test('tests async', function() {
      var test = tests.async[0];
      tests.async.forEach(function(item) {
        assert.strictEqual(test, item);
      });
    });

    test('suite', function() {
      var suite = suites.pass[0];
      suites.pass.forEach(function(item) {
        assert.strictEqual(suite, item);
      });
    });
  });

});

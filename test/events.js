suite('events', function() {

  function event(input, callback) {
    var file, type;

    if (typeof input === 'string')
      file = type = input;

    if (typeof input === 'object') {
      file = input[0];
      type = input[1];
    }


    test('event: ' + type, function(done) {
      runFixture(file, function(err, emit) {
        if (err) return done(err);
        callback(emit, done);
      });
    });
  }

  function isTest(input, obj) {
    assert.ok(input.fn.indexOf('function') !== -1, 'has function');
    assert.ok(input.title);
    assert.equal(input.type, 'test');

    if (obj) {
      for (var key in obj) {
        assert.equal(input[key], obj[key], key);
      }
    }
  }

  function aggregate(event, emitter) {
    var result = {};
    emitter.on(event, function(data, err) {
      // copy the err property if available.
      if (err)
        data.err = err;

      result[data.title] = data;
    });
    return result;
  }

  function isError(err, msg) {
    if (msg)
      assert.ok(err.msg.matches(msg), 'matches msg');

    assert.ok(err.stack, 'err.stack');
  }

  ['test', 'test end'].forEach(function(eventName) {
    event(['pass', eventName], function(emit, done) {
      var testEnd = aggregate('test end', emit);

      emit.on('helper end', function() {
        isTest(testEnd.sync);
        isTest(testEnd.async);
        done();
      });
    });
  });


  event('fail', function(emit, done) {
    var fails = aggregate('fail', emit);

    emit.on('helper end', function() {
      isTest(fails.sync, { state: 'failed' });
      isTest(fails.async, { state: 'failed' });
      isTest(fails.uncaught, { state: 'failed' });

      assert.ok(fails.sync.err, 'sync has err');
      assert.ok(fails.async.err, 'async has err');

      isError(fails.sync.err);
      isError(fails.async.err);
      isError(fails.uncaught.err);
      assert.ok(fails.uncaught.err.uncaught, 'is uncaught');

      done();
    });
  });

  event('pass', function(emit, done) {
    var passed = aggregate('pass', emit);

    emit.on('helper end', function() {
      assert.ok(passed.sync, 'sync test');
      assert.ok(passed.async, 'async test');

      isTest(passed.sync, { state: 'passed' });
      isTest(passed.async, { state: 'passed' });
      done();
    });
  });

  event('pending', function(emit, done) {
    emit.once('pending', function(data) {
      assert.equal(data.title, 'mepending', 'title');
      assert.ok(data.pending, 'pending');
      done();
    });
  });

});

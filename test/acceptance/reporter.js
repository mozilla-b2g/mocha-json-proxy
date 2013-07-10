suite('reporter', function() {
  var fork = require('child_process').fork;
  var exec = __dirname + '/../../node_modules/.bin/_mocha';
  var cmd = [
    '--reporter', + __dirname + '/../../reporter.js',
    __dirname + '/../fixtures/pass'
  ];

  var runnerOpts = {
    env: { MOCHA_PROXY_SEND_ONLY: '1' }
  };

  var msgs = [];
  var child;

  setup(function(done) {
    this.timeout('10s');
    child = fork(exec, cmd, runnerOpts);
    child.on('message', function(content) {
      if (Array.isArray(content) && content[0] === 'mocha-proxy') {
        var msg = content[1];
        msgs.push(msg[0]);
        if (msg[0] === 'end')
          return done();
      }
    });

  });

  test('got messages', function() {
    var expectedMsgs = [
      'start',
      'suite',
      'suite',
      'test',
      'pass',
      'test end',
      'test',
      'pass',
      'test end',
      'suite end',
      'suite end',
      'end'
    ];

    assert.deepEqual(msgs, expectedMsgs);
  });

});

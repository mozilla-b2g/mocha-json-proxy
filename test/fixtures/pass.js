suite('pass', function() {
  test('sync', function() {});
  test('async', function(done) { process.nextTick(done); });
});


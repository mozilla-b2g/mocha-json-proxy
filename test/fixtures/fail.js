suite('fail', function() {
  test('sync', function() {
    throw new Error('sync');
  });

  test('async', function(done) {
    done(new Error('async'));
  });
});

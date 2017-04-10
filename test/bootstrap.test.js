var sails = require('sails');

before(function(done) {

  // Increase the Mocha timeout so that Sails has enough time to lift.
  this.timeout(8000);

  sails.lift({
    // configuration for testing purposes
    log:{
      level: 'error'
    },
    session:{
      host: 'redis',
      port: 6379
    },
    sockets:
    {
      host: 'redis',
      port: 6379
    },
    models: {
      migrate: 'create'
    }
  }, function(err) {
    if (err) return done(err);
    // here you can load fixtures, etc.
    
    done(err, sails);
  });
});

after(function(done) {
  // here you can clear fixtures, etc.
  sails.lower(done);
});
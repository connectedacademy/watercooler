var request = require('supertest');

describe('Auth', function() {

  describe('login', function() {
    it('should redirect to Twitter', function (done) {
      request(sails.hooks.http.app)
        .get('/auth/login')
        .expect(302,done);
    });
  });
});
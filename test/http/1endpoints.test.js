var request = require('supertest');
var expect = require('chai').expect;

describe('Auth', function() {
  
  describe('user login', function() {
    it('should redirect to Twitter', function (done) {
      request(sails.hooks.http.app)
        .get('/auth/login')
        .expect(302,done);
    });
  });

  describe('admin login', function() {
    it('should redirect to GitHub', function (done) {
      request(sails.hooks.http.app)
        .get('/admin/login')
        .expect(302,done);
    });
  });

  describe('user logout', function() {
    it('should return message', function () {
      return request(sails.hooks.http.app)
        .get('/auth/logout')
        .expect(200)
        .then(response => {
          expect(response.body).to.have.property('msg');
        });
    });
  });

  describe('admin logout', function() {
    it('should return message', function () {
      return request(sails.hooks.http.app)
        .get('/admin/logout')
        .expect(200)
        .then(response => {
          expect(response.body).to.have.property('msg');
        });
    });
  });
});
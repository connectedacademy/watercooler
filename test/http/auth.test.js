var request = require('supertest');
var expect = require('chai').expect;

describe('Auth', function() {
  
  describe('user login', function() {

    it('should redirect to Twitter', function (done) {
      request(sails.hooks.http.app)
        .get('/auth/login')
        .set('Referer',process.env.TEST_DOMAIN)
        .expect(302,done);
    });

    // it('should error when no origin or referrer', function (done) {
    //   request(sails.hooks.http.app)
    //     .get('/auth/login')
    //     .expect(500,done);
    // });

  });

  describe('admin login', function() {

    it('should redirect to GitHub', function (done) {
      request(sails.hooks.http.app)
        .get('/admin/login')
        .set('Referer',process.env.TEST_DOMAIN)
        .expect(302,done);
    });

    // it('should error when no origin or referrer', function (done) {
    //   request(sails.hooks.http.app)
    //     .get('/admin/login')
    //     .expect(500,done);
    // });



  });

  describe('user logout', function() {

    it('should return message', function (done) {
      request(sails.hooks.http.app)
        .get('/auth/logout')
        .expect(200)
        .expect((res)=>{
          bodyCheck(res.body,{
            msg:'msg'
          });
        })
        .end(done);
    });

  });

  describe('admin logout', function() {

    it('should return message', function (done) {
      request(sails.hooks.http.app)
        .get('/admin/logout')
        .expect((res)=>{
          bodyCheck(res.body,{
            msg:'msg'
          });
        })
        .expect(200,done);
    });

  });

});
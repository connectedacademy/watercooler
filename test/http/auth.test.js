var request = require('supertest');
var expect = require('chai').expect;

describe('Auth', function() {
  
  describe('user login', function() {

    // it('should redirect to Twitter', function (done) {
    //   request(sails.hooks.http.app)
    //     .get('/auth/login')
    //     .set('Referer',process.env.TEST_DOMAIN)
    //     .expect(302,done);
    // });

    it('should error when no origin or referrer', function (done) {
      request(sails.hooks.http.app)
        .get('/v1/auth/login')
        .expect(403,done);
    });

  });

  describe('admin login', function() {

    // it('should redirect to GitHub', function (done) {
    //   request(sails.hooks.http.app)
    //     .get('/admin/login')
    //     .set('Referer',process.env.TEST_DOMAIN)
    //     .expect(302,done);
    // });

    it('should error when no origin or referrer', function (done) {
      request(sails.hooks.http.app)
        .get('/v1/admin/login')
        .expect(403,done);
    });

  });

  describe('user logout', function() {

    it('should return message', function (done) {
      request(sails.hooks.http.app)
        .get('/v1/auth/logout')
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
        .get('/v1/admin/logout')
        .expect((res)=>{
          bodyCheck(res.body,{
            msg:'msg'
          });
        })
        .expect(200,done);
    });

  });

  describe('user dashboard', function() {

    it('should redirect to correct server', function (done) {
      global.useragent
        .get('/v1/auth/dashboard')
        .set('Referer',process.env.TEST_DOMAIN)
        .expect(302)
        .end(done);
    });

  });

  describe('admin dashboard', function() {

    it('should redirect to correct server', function (done) {
      global.adminagent
        .get('/v1/auth/admindashboard')
        .set('Referer',process.env.TEST_DOMAIN)
        .expect(302)
        .end(done);
    });

  });

   describe('user profile', function() {

        it('should return user profile', function (done) {
            global.useragent
            .get('/v1/auth/me')
            .set('Referer',process.env.TEST_DOMAIN)
            .expect(200)
            .expect((res)=>{
                expect(res.body).to.have.property('user');
            })
            .end(done);
        });

        it('should return admin profile', function (done) {
            global.adminagent
            .get('/v1/auth/me')
            .set('Referer',process.env.TEST_DOMAIN)
            .expect(200)
            .expect((res)=>{
                expect(res.body).to.have.property('admin');
            })
            .end(done);
        });

  });


  describe('registration', function() {

        it('should return user profile', function (done) {
            global.useragent
            .post('/v1/auth/register')
            .set('Referer',process.env.TEST_DOMAIN)
            .send({
                consent: true,
                lang: "en",
                hub_id: "ncl",
                age: "30-40",
                email: "tom@bartindale.com",
                registration_info:{
                    "are you yellow":"no",
                    "do you have cheese feet":"yes"
                }
            })
            .expect(200)
            .expect((res)=>{
                expect(res.body).to.have.property('msg');
            })
            .end(done);
        });
        
  });
  
  describe('update profile', function() {

        it('should update profile', function (done) {
            global.useragent
            .post('/v1/auth/profile')
            .set('Referer',process.env.TEST_DOMAIN)
            .send({
                lang:"ar",
                hub_id:"ncl",
                email:"tom@bartindale.com"
            })
            .expect(200)
            .expect((res)=>{
                expect(res.body).to.have.property('msg');
            })
            .end(done);
        });

  });
  

});
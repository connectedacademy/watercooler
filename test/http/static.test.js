var request = require('supertest');
var expect = require('chai').expect;

describe('Status', function() {

  it ('should return valid status info',function(done){
    request(sails.hooks.http.app)
      .get('/')
      .expect((res)=>{
        bodyCheck(res.body,'status');
      })
      .expect(200,done);
  });

});

describe('Course Info', function() {

  describe('Spec',function(done){

    it ('should return valid spec',function(done){
      
      request(sails.hooks.http.app)
          .get('/course/spec')
          .set('Referer',process.env.TEST_DOMAIN)
          .expect((res)=>{
            bodyCheckYaml(res.body,'spec');
          })
          .expect(200,done);

    });

  });

  describe('Hubs',function(done){

    it ('should return valid spec',function(done){

      request(sails.hooks.http.app)
          .get('/course/spec')
          .set('Referer',process.env.TEST_DOMAIN)
          .expect((res)=>{
            bodyCheckYaml(res.body,'hubs');
          })
          .expect(200,done);

    });

  });

});
 
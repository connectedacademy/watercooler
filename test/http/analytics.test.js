var request = require('supertest');
var expect = require('chai').expect;

describe('Analytics', function() {

  describe('Question',function(){

    it ('should return single valid question',function(done){

      global.useragent
      .get('/analytics/question/1/pre')
      .set('Referer',process.env.TEST_DOMAIN)
      .expect(200)
      .expect((res)=>{
        bodyCheck(res.body,'question');
      })
      .end(done);
    });

  });

  describe('Answer',function(){
    it ('should allow posting answer',function(done){

      global.useragent
      .post('/analytics/answer/response')
      .set('Referer',process.env.TEST_DOMAIN)
      .expect((res)=>{
          expect(res.body).to.have.property('msg')
      })
      .expect(200)
      .end(done);
    });

  });

  describe('Answers',function(){

    // it('should not work for user access', function (done) {
        
    


    // });


    it ('should return list of users',function(done){

        global.adminagent
        .get('/analytics/answers')
        .set('Referer',process.env.TEST_DOMAIN)
        .expect(200)
        .expect((res)=>{
            expect(res.body).to.be.an.array;
            // console.log(res.body);
        })
        .end(done);
    });

  });

});
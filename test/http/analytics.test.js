var request = require('supertest');
var expect = require('chai').expect;

describe('Analytics', function() {

  describe('Question',function(){

    it ('should return single valid question',function(done){

      global.useragent
      .get('/v1/analytics/question/1/pre')
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
      .post('/v1/analytics/answer/response')
      .set('Referer',process.env.TEST_DOMAIN)
      .expect((res)=>{
          expect(res.body).to.have.property('msg')
      })
      .expect(200)
      .end(done);
    });

  });

  describe('Answers',function(){

    it ('should return list of users',function(done){

        global.adminagent
        .get('/v1/analytics/answers')
        .set('Referer',process.env.TEST_DOMAIN)
        .expect(200)
        .expect((res)=>{
            expect(res.body).to.be.an.array;
            _.each(res.body, (b)=>{
                _.each(b.answers,(a)=>{
                    bodyCheck(b,{
                        "question_id":1,
                        "user":"tombartindale",
                        "class":1,
                        "content_index":4,
                        "answer":4
                    });
                });
            });
        })
        .end(done);
        
    });

  });

});
var request = require('supertest');
var expect = require('chai').expect;

describe('Messaging', function() {

  describe('Create',function(done){
    it ('should create message',function(done){

      global.useragent
      .post('/messages/create')
      .set('Referer',process.env.TEST_DOMAIN)
      .expect((res)=>{
          expect(res.body).to.have.property('id')
      })
      .expect(200)
      .end(done);
    });

  });
  
  describe('Visualisation',function(done){

    it ('should return correct list',function(done){

        global.useragent
        .get('/messages/visualisation/1/1')
        .set('Referer',process.env.TEST_DOMAIN)
        .expect((res)=>{
            bodyCheck(res.body,'visulisationpoints');
        })
        .expect(200)
        .end(done);
    });

  });

  describe('List',function(done){
      
    it ('should return correct list',function(done){

        global.useragent
        .get('/messages/list/1/1/2')
        .set('Referer',process.env.TEST_DOMAIN)
        .expect((res)=>{
            bodyCheck(res.body,'messages');
        })
        .expect(200)
        .end(done);
    });

  });

  describe('Subscribe',function(done){

     it ('should succeed',function(done){

       global.useragent
        .get('/messages/subscribe/1/1/2')
        .set('Referer',process.env.TEST_DOMAIN)
        .expect((res)=>{
            expect(res.body).to.have.property('msg');
        })
        .expect(200)
        .end(done);

     });

  });

  describe('Likes',function(done){
      
    it ('should return total',function(done){

        global.useragent
        .get('/messages/likes/testuri')
        .set('Referer',process.env.TEST_DOMAIN)
        .expect((res)=>{
            expect(res.body).to.be.a.number
        })
        .expect(200)
        .end(done);
    });

  });

});
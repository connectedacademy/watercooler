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
  
//   describe('Visualisation',function(done){
      
//   });

//   describe('List',function(done){
      
//   });

//   describe('Subscribe',function(done){
      
//   });

//   describe('Likes',function(done){
      
//   });

});
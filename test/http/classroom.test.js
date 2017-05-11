var request = require('supertest');
var expect = require('chai').expect;

describe('In-Situ Classroom', function() {

  describe('#My Code',function(done){

      it ('should return valid code',function(done){

        global.useragent
        .get('/v1/classroom/mycode/1/1')
        .set('Referer',process.env.TEST_DOMAIN)
        .expect(200)
        .expect((res)=>{
            bodyCheck(res.body,'mycode');
        })
        .end(done);

      });

  });

  describe('#Users',function(done){

      it ('should return list of users',function(done){

        global.useragent
        .get('/v1/classroom/users/1/1')
        .set('Referer',process.env.TEST_DOMAIN)
        .expect((res)=>{
            expect(res.body).to.be.an.array;
        })
        .expect(200)
        .end(done);

      });

  });

});
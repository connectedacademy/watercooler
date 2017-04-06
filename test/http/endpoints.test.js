var request = require('supertest');
var expect = require('chai').expect;

// var _ = require('lodash');
var flat = require('flat');
var _ = require('lodash');

var deepTypeMatch = function(expected, actual)
{
  //map types:
  var flatted = flat(expected);
  // console.log(flatted);
  var mapped = _.forOwn(flatted,(v,k)=>{
    return typeof(flatted[k])
  })
  console.log(mapped);
  // throw JSON.stringify(expectedtypes);
  //deep compare:
};

 deepTypeMatch({
    msg:'string msg',
    second:{
      third:'asdasdas'}
  },
  {
    msg:345
  });

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
          deepTypeMatch({
            msg:'string msg'
          },
          response.body);

          // expect(response.body).to.have.property('msg');
        });
    });
  });
});
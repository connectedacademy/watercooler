var request = require('supertest');
var expect = require('chai').expect;

var flat = require('flat');
var _ = require('lodash');

_.deepTypeMatch = function(expected, actual)
{
  var exp_flatted = flat(expected);
  var exp_mapped = _.mapValues(exp_flatted,(v,k)=>{
    return typeof(exp_flatted[k])
  });
  var act_flatted = flat(actual);
  var act_mapped = _.mapValues(act_flatted,(v,k)=>{
    return typeof(act_flatted[k])
  });

  return _.isEqual(act_mapped,exp_mapped);
};

let bodyCheck = function(body, comparefile)
{
  let example = comparefile;
  if (_.isString(comparefile))
    example = require('../spec/examples/' + comparefile + '.json');
  if (!_.deepTypeMatch(body,example))
    throw new Error("Result does not match the required fields");
}

global.bodyCheck = bodyCheck;

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
        });
    });
  });
});
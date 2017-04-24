process.env.CI = true

var sails = require('sails');
var request = require('supertest');

let yaml = require('js-yaml');
let fs = require('fs');
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

  // console.log(act_mapped);
  // console.log(exp_mapped);
  

  return _.isEqual(act_mapped,exp_mapped);
};

let bodyCheck = function(body, comparefile)
{
  let example = comparefile;
  if (_.isString(comparefile))
    example = require('../spec/examples/' + comparefile + '.json');
  if (!_.deepTypeMatch(body,example))
    throw new Error("Result does not match the required fields " + JSON.stringify(body));
}

let bodyCheckYaml = function(body, comparefile)
{
  fs.readFile('../spec/examples/' + comparefile + '.yaml', (data)=>{
    let yaml = yaml.safeLoad(data);
    if (!_.deepTypeMatch(body,yaml))
      throw new Error("Result does not match the required yaml fields " + JSON.stringify(body));
  });
}

global.bodyCheck = bodyCheck;
global.bodyCheckYaml = bodyCheckYaml;


before(function(done) {

  // Increase the Mocha timeout so that Sails has enough time to lift.
  this.timeout(20000);

  sails.lift({
    // configuration for testing purposes
    log:{
      level: 'error'
    },
    session:{
      host: 'redis',
      port: 6379
    },
    sockets:
    {
      host: 'redis',
      port: 6379
    },
    models: {
      connection: 'sails-memory',
      migrate: 'create'
    }
  }, async function(err) {
    if (err) return done(err);
    // here you can load fixtures, etc.

    global.freshuser =  request.agent(sails.hooks.http.app);    
    global.useragent =  request.agent(sails.hooks.http.app);
    global.adminagent = request.agent(sails.hooks.http.app);

    try
    {
      //DO LOGIN WITH AUTH
      await global.useragent
      .get('/auth/testuserlogin')
      .set('Referer',process.env.TEST_DOMAIN)
      .expect(302);

      await global.adminagent
        .get('/auth/testadminlogin')
        .set('Referer',process.env.TEST_DOMAIN)
        .expect(302);
      
      done(err, sails);
    }
    catch (e)
    {
      throw new Error("Test Environment not Setup Properly " + e);
    }

  });
});

after(function(done) {
  // here you can clear fixtures, etc.
  sails.lower(done);
});
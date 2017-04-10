var sails = require('sails');

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

before(function(done) {

  // Increase the Mocha timeout so that Sails has enough time to lift.
  this.timeout(10000);

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
      migrate: 'create'
    }
  }, function(err) {
    if (err) return done(err);
    // here you can load fixtures, etc.
    
    done(err, sails);
  });
});

after(function(done) {
  // here you can clear fixtures, etc.
  sails.lower(done);
});
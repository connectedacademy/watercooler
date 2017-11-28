process.env.CI = true

var sails = require('sails');
var request = require('supertest-as-promised');

let yaml = require('js-yaml');
let fs = require('fs');
var _ = require('lodash');

global.agents = [];



before(function(done) {

  // Increase the Mocha timeout so that Sails has enough time to lift.
  this.timeout(20000);

  for (let i=0;i<100;i++)
  {
    let a = request.agent('https://api.connectedacademy.io');
    agents.push(a);
  }

  done();

});
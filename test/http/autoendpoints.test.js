var path = require('path');
var parser = require('raml-1-parser');
var spec = parser.loadApiSync(path.join(__dirname ,'..','..', 'spec','raml','watercooler.raml'));
var apiNode = spec.highLevel();
var _ = require('lodash');
var Validator = require('raml-js-validator/lib/validator.js');
// console.log(spec.types());

const validator = new Validator(
    spec,
    "http://localhost:1337",
    "--validate-response"
);

// describe('Auto Endpoint Validator', function() {
//     it('should have valid endpoints', function (done) {
//         validator.validate();
//     });
// });


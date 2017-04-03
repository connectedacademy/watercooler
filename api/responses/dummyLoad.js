let fs = require('fs-promise');

module.exports = async function dummyLoad (filename) {

  // Get access to `req`, `res`, & `sails`
  var req = this.req;
  var res = this.res;
  var sails = req._sails;

  sails.log.verbose('Sending 200 ("Dummy") response: ',filename);

  let data = await fs.readFile(__dirname + '/../../spec/examples/' + filename);
  return res.status(200).send(data);
};


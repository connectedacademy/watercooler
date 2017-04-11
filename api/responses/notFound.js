module.exports = function notFound (data, options) {

  // Get access to `req`, `res`, & `sails`
  var req = this.req;
  var res = this.res;
  var sails = req._sails;

  console.log("404")
  // console.log(req)

  // Set status code
  return res.status(404).json({
    msg: 'Not Found',
    data: data
  })

};


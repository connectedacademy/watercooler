/**
 * 403 (Forbidden) Handler
 *
 * Usage:
 * return res.forbidden();
 * return res.forbidden(err);
 * return res.forbidden(err, 'some/specific/forbidden/view');
 *
 * e.g.:
 * ```
 * return res.forbidden('Access denied.');
 * ```
 */

module.exports = function forbidden (data) {

  // Get access to `req`, `res`, & `sails`
  var req = this.req;
  var res = this.res;
  var sails = req._sails;

  // Log error to console
  if (data !== undefined) {
    sails.log.verbose('Sending 403 ("Forbidden") response: ',data);
  }
  else sails.log.verbose('Sending 403 ("Forbidden") response');

  return res.status(403).json({
    msg: 'Not Authorised',
    data: data
  });
};


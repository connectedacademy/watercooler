/**
 * HTTP Server Settings
 * (sails.config.http)
 *
 * Configuration for the underlying HTTP server in Sails.
 * Only applies to HTTP requests (not WebSockets)
 *
 * For more information on configuration, check out:
 * http://sailsjs.org/#!/documentation/reference/sails.config/sails.config.http.html
 */


module.exports.http = {

  middleware: {

    validator: require('express-validator')({
      customValidators: {}
    }),

    passportInit    : require('passport').initialize(),
    passportSession : require('passport').session(),
    userAgent       : require('express-useragent').express(),

    startRequestTimer: function startRequestTimer(req, res, next) {
      req._startTime = new Date();
      next();
    },

    responseTimeLogger: function(req, res, next) {
      res.on("finish", function() {
        // sails.log.verbose("Timing: " + req.method, req.url, res.get('X-Response-Time'));
        let user = null;
        if (req.session && req.session.passport && req.session.passport.user)
           user = req.session.passport.user.id;
        sails.log.verbose('Endpoint',{
          url: req.method + ' ' + req.path,
          session: req.session.id,
          referrer: req.get('referer') || req.get('origin'),
          user: user,
          agent: _.pick(req.useragent, _.identity),
          query: req.query,
          params: req.params.all(),
          time: res.get('X-Response-Time')
        });
      });
      require('response-time')()(req, res, next);
    },

    order: [
      'startRequestTimer',
      'responseTimeLogger',
      'cookieParser',
      'session',
      'bodyParser',
      'validator',
      'passportInit',
      'passportSession',
      'userAgent',
      'handleBodyParserError',
      'compress',
      'methodOverride',
      'poweredBy',
      '$custom',
      'router',
      'www',
      'favicon',
      '404',
      '500'
    ]
  },
};

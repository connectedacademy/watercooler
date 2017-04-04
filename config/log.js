var winston = require('winston');
var customLogger = new winston.Logger();

// A console transport logging debug and above.
customLogger.add(winston.transports.Console, {
  level: 'debug',
  colorize: true
});

//REMOTE LOGGING TO LOGGLY
if (!process.env.CI)
{
  require('winston-loggly-bulk');
  customLogger.add(winston.transports.Loggly, {
    subdomain: process.env.LOGGLY_API_DOMAIN,
    token:process.env.LOGGLY_API_KEY,
    tags:['watercooler'],
    level:'error',
    json: true
  });
}

//LOCAL LOGGING TO ORIENTDB
// require('winston-orientdb').OrientDB;
// customLogger.add(winston.transports.OrientDB, {
//   level:'info',
//   connection:{
//     host: process.env.ORIENTDB_HOST,
//     port: process.env.ORIENTDB_PORT,
//     username: process.env.ORIENTDB_USERNAME,
//     password: process.env.ORIENTDB_PASSWORD,
//   },
//   db:{
//     name: process.env.ORIENTDB_DB,
//     username: process.env.ORIENTDB_USERNAME,
//     password: process.env.ORIENTDB_PASSWORD
//   },
//   storeHost: true
// });

module.exports.log = {
  // Pass in our custom logger, and pass all log levels through.
  custom: customLogger,
  level: 'verbose',

  // Disable captain's log so it doesn't prefix or stringify our meta data.
  inspect: false
};

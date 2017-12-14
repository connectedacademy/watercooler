var winston = require('winston');
var customLogger = new winston.Logger();
let os = require('os');

// A console transport logging debug and above.
customLogger.add(winston.transports.Console, {
  level: (process.env.NODE_ENV == 'production')?'error':'verbose',
  colorize: true,
  timestamp:true
});

//REMOTE LOGGING
if (!process.env.CI && process.env.NODE_ENV=='production')
{
  let logzioWinstonTransport = require('winston-logzio');
  let loggerOptions = {
      token: process.env.LOGZ_TOKEN,
      host: 'listener.logz.io',
      type: 'watercooler',
      level: 'verbose'
  };
  customLogger.on('error',(err)=>{
    console.error(err);
  });
  customLogger.add(logzioWinstonTransport,loggerOptions);
    
  let winstonAwsCloudWatch = require('winston-cloudwatch');
  customLogger.add(winstonAwsCloudWatch, {
    logGroupName: 'ConnectedAcademyAPI',
    logStreamName:'watercooler',
    awsRegion: process.env.AWS_DEFAULT_REGION,
    jsonMessage: true,
    level:'verbose'
  });
}

module.exports.log = {
  // Pass in our custom logger, and pass all log levels through.
  custom: customLogger,
  level: 'verbose',

  // Disable captain's log so it doesn't prefix or stringify our meta data.
  inspect: false
};

var winston = require('winston');
var customLogger = new winston.Logger();
let os = require('os');

// A console transport logging debug and above.
customLogger.add(winston.transports.Console, {
  level: 'verbose',
  colorize: true
});

//REMOTE LOGGING
if (!process.env.CI && process.env.NODE_ENV=='production')
{
  let winstonAwsCloudWatch = require('winston-cloudwatch');
  customLogger.on('error',(err)=>{
    console.log(err);
  });
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

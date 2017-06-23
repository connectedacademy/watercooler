let Redis = require('ioredis');
let redis = new Redis(process.env.REDIS_PORT, process.env.REDIS_HOST); //new Redis(6379, '192.168.1.1')

module.exports = function(sails)
{
    return {
        initialize:(cb)=>{

            sails.on('hook:orm:loaded', async function() {

                redis.subscribe('submissions', function (err, count) {
                    sails.log.info('Subscribed to submissions channel on Redis');
                });

                redis.on('message', async function (channel, message) {
                    switch (channel)
                    {
                        case 'submissions':
                            sails.log.verbose('PubSub Submission',message);
                            newSubmission(message);
                            break;
                    }

                });

                cb();
            });
        }
    }
}

var newSubmission = async function(subid){
    //broadcast to this user's subscription:
    let submission = await Submission.findOne(subid).populate('user');
    Submission.removeCircularReferences(submission);
    sails.log.verbose('WS message to ',submission.user.toString());
    submission.msgtype = 'submission';
    User.message(submission.user.toString(), submission);
}
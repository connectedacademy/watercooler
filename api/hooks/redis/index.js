let Redis = require('ioredis');
let redis = new Redis(
    {
        port: process.env.REDIS_PORT,           // Redis port
        host: process.env.REDIS_HOST,   // Redis host
        db: 2
      });

// let RedisIO = require('ioredis');
// let redisIO = new RedisIO(process.env.REDIS_PORT, process.env.REDIS_HOST, {
//     db: 4
// });

module.exports = function(sails)
{
    return {
        initialize:(cb)=>{

            sails.on('hook:orm:loaded', async function() {

                //Fill up redis cache for each segment and each user that has submitted in the block:
                sails.log.info('RedisConsumer',{msg:'Loading message lookup into redis'});
                
                let messages = await Message.find({},{
                    select:['user','course','class','content','segment']
                });

                let commands = [];
                for (let msg of messages)
                {
                    commands.push(['set',`wc:lookup:${msg.course}:${msg.class}:${msg.content}:${msg.segment}:${msg.user}`,true]);
                }

                await redis.pipeline(commands).exec();

                // console.log(messages);


                redis.subscribe('submissions', function (err, count) {
                    sails.log.info('RedisConsumer',{msg:'Subscribed to submissions channel on Redis'});
                });

                redis.on('message', async function (channel, message) {
                    switch (channel)
                    {
                        case 'submissions':
                            sails.log.silly('PubSub Submission',message);
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
    sails.log.silly('WS message to ',submission.user.id.toString());
    let wrapped = {
        msgtype: 'submission',
        msg: submission
    };
    User.message(submission.user.id.toString(), wrapped);
}
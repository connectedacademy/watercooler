let io = require('socket.io-client')(process.env.GOSSIPMILL_URL);
io.on('connect',function(msg){
    sails.log.info('Gossipmill API Socket Connected');
});

let request = require('request-promise-native');

let baseURI = process.env.GOSSIPMILL_URL;

module.exports = {

    visualisation: async (course, klass, user, language)=>{
        let response = await request({
            url: baseURI + 'messages/visualisation',
            method: 'POST',
            json: true,
            body:{
                lang: language,
                group_by: {
                    name: 'segment'
                },
                filter_by:[
                    {
                        name: 'course',
                        query: course
                    },
                    {
                        name: 'class',
                        query: klass
                    },
                    {
                        name: 'user',
                        query: user.id
                    }
                ]
            },
            qs: {
                psk: process.env.GOSSIPMILL_PSK
            }
        });
        return response;
    },

    totals: async (course, klass, content)=>{
        let response = await request({
            url: baseURI + 'messages/totals',
            method: 'POST',
            json: true,
            body:{
               filter_by:[
                    {
                        name: 'course',
                        query: course
                    },
                    {
                        name: 'like',
                        query: klass+'/'+content
                    }
                ]
            },
            qs: {
                psk: process.env.GOSSIPMILL_PSK
            }
        });
        return response;
    },

    list: async (course, klass, user, language, contentid, startsegment, endsegment, depth)=>{
        let query = [
            {
                name: 'course',
                query: course
            },
            {
                name: 'class',
                query: klass
            },
            {
                name: 'content',
                query: contentid
            }
        ];
        
        for (let i=startsegment;i<=endsegment;i++) 
        {
            query.push({
                name:'segment',
                query: i
            });
        }

        sails.log.verbose('Requesting list');

        let response = await request({
            url: baseURI + 'messages/list/' + user.service + '/' + user.account,
            method: 'POST',
            json: true,
            body:{
                filter_by: query,
                depth: depth || 10,
                lang: language
            },
            qs: { 
                psk: process.env.GOSSIPMILL_PSK
            }
        });

        response.data = _.map(response.data,(d)=>{
            _.each(d.tokens,(t)=>{
                d[t.type] = t.name;
            });
            delete d.tokens;
            return d;
        });

        response.data = _.groupBy(response.data, 'segment');

        return response;
    },

    subscribe: async (req, course, klass, user, language,contentid, startsegment, endsegment) =>{
        //TODO: subscribe to gossipmill feed
        let query = [
            {
                name: 'course',
                query: course
            },
            {
                name: 'class',
                query: klass
            },
            {
                name: 'content',
                query: contentid
            }
        ];
        
        for (let i=startsegment;i<=endsegment;i++)
        {
            query.push({
                name:'segment',
                query: i
            })
        }
        
        //lang: language

        //TODO: socket subscribe
        // io.

        

        //TODO: map socket response messages to ours:


    },

    create: async (credentials, user, message)=>{
        let response = await request({
            url: baseURI + 'messages/create',
            method: 'POST',
            json: true,
            body:{
                text: message.text,
                replyto: message.replyto,
                retweet: message.retweet,
                credentials:{
                    service: user.service,
                    key: credentials.key,
                    secret: credentials.secret,
                    token: user.credentials.token,
                    tokenSecret: user.credentials.tokenSecret
                }
            },
            qs: {
                psk: process.env.GOSSIPMILL_PSK
            }
        });
        return response;
    }
}
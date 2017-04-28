// let io = require('sails.io.js')( require('socket.io-client') );
let request = require('request-promise-native');
// let request = require('request');

let baseURI = process.env.GOSSIPMILL_URL;

module.exports = {

    visualisation: async (course, klass, user, language)=>{
        let response = await request({
            url: baseURI + 'messages/visualisation',
            method: 'POST',
            json: true,
            body:{
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
                    },
                    {
                        name:'lang',
                        query: language
                    }
                ]
            },
            qs: {
                psk: process.env.GOSSIPMILL_PSK
            }
        });
        return response;
    },

    totals: async (pageuri)=>{
        let response = await request({
            url: baseURI + 'messages/totals',
            method: 'POST',
            json: true,
            body:{
               filter_by:[
                    {
                        name: 'uri',
                        query: pageuri
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
                name: 'contentid',
                query: contentid
            },
            {
                name: 'user',
                query: user.id
            },
            {
                name:'lang',
                query: language
            }
        ];
        
        for (let i=startsegment;i<endsegment;i++)
        {
            query.push({
                name:'segment',
                query: i
            })
        }

        //TODO: socket subscribe

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
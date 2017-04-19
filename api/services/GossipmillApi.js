// let io = require('sails.io.js')( require('socket.io-client') );
let request = require('request');

let baseURI = process.env.GOSSIPMILL_URL;

module.exports = {

    visualisation: async (course, klass, user, language)=>{
        let response = await request({
            url: basedURI + 'messages/visualisation',
            method: 'POST',
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
            url: basedURI + 'messages/totals',
            method: 'POST',
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

    list: async (course, klass, user, language,contentid, startsegment, endsegment)=>{
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
        
        for (let i=start-segment;i<end-segment;i++)
        {
            query.push({
                name:'segment',
                query: i
            })
        }

        let response = await request({
            url: basedURI + 'messages/list',
            method: 'POST',
            body:{
                filter_by: query
            },
            qs: {
                service: user.service,
                user: user.account,
                psk: process.env.GOSSIPMILL_PSK
            }
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
        
        for (let i=start-segment;i<end-segment;i++)
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
            url: basedURI + 'messages/create',
            method: 'POST',
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
// let sailsio = require('socket.io-client')(process.env.GOSSIPMILL_URL);
var socketIOClient = require('socket.io-client');
var sailsIOClient = require('sails.io.js');
var io = sailsIOClient(socketIOClient);
io.sails.environment = 'production';
io.sails.url = process.env.GOSSIPMILL_URL;
io.sails.reconnection = true;
io.sails.initialConnectionHeaders = {nosession: true};

io.socket.on('connect',function(){
    sails.log.info('Gossipmill API Socket Connected');
});

io.socket.on('disconnect',function(){
    sails.log.info('Gossipmill API Socket disconnect');    
});

io.socket.on('reconnect',function(){
    sails.log.info('Gossipmill API Socket reconnect');    
});

io.socket.on('reconnect_attempt',function(){
    sails.log.info('Gossipmill API Socket reconnect_attempt');    
});

io.socket.on('reconnecting',function(num){
    sails.log.info('Gossipmill API Socket reconnecting', num);    
});

let request = require('request-promise-native');

let baseURI = process.env.GOSSIPMILL_URL;

let sockethandlers = {};

module.exports = {

    visualisation: async (course, klass,content, language, whitelist)=>{
        let response = await request({
            url: baseURI + 'messages/visualisation',
            method: 'POST',
            json: true,
            body:{
                lang: language,
                whitelist: whitelist,
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
                        name: 'content',
                        query: content
                    }
                ]
            },
            qs: {
                psk: process.env.GOSSIPMILL_PSK
            }
        });

        let min = 0;
        let max = parseInt(_.max(response,'segment').segment);
        let max_val = _.max(response,'count').count;
        let ordered = {};

        for(let i=min;i<=max;i++)
        {
            let seg = _.find(response,{segment:i+''});
            if (seg)
                ordered[i] = seg.count / max_val;
            else
                ordered[i] = 0;
        }
        return ordered;
    },

    totals: async (course, klass, content)=>{
        let response = await request({
            url: baseURI + 'messages/totals',
            method: 'POST',
            json: true,
            body:{
               group_by:{
                name:'tag'
               },
               filter_by:[
                    {
                        name: 'course',
                        query: course
                    },
                    {
                        name: 'tag',
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

    allTotals: async (course)=>{
       let response = await request({
            url: baseURI + 'messages/totals',
            method: 'POST',
            json: true,
            body:{
               group_by:{
                name:'tag'
               },
               filter_by:[
                    {
                        name: 'course',
                        query: course
                    }
                ]
            },
            qs: {
                psk: process.env.GOSSIPMILL_PSK
            }
        });
        return response;
    },

    summary: async (course, klass, user, language, contentid, startsegment, endsegment, whitelist)=>{
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
        
        for (let i=parseInt(startsegment);i<=parseInt(endsegment);i++) 
        {
            query.push({
                name:'segment',
                query: i
            });
        }

        sails.log.verbose('Requesting summary');

        let response = await request({
            url: baseURI + 'messages/summary/' + user.service + '/' + user.account,
            method: 'POST',
            json: true,
            body:{
                whitelist:whitelist,
                filter_by: query,
                lang: language
            },
            qs: { 
                psk: process.env.GOSSIPMILL_PSK
            }
        });

        return response;
    },

    list: async (course, klass, user, language, contentid, startsegment, endsegment, depth, whitelist)=>{
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
        
        for (let i=parseInt(startsegment);i<=parseInt(endsegment);i++) 
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
                whitelist: whitelist,
                depth: depth || 10,
                lang: language
            },
            qs: { 
                psk: process.env.GOSSIPMILL_PSK
            }
        });

        response.data = _.groupBy(response.data, 'segment');

        return response;
    },

    subscribe: async (req, course, klass, user, language,contentid, startsegment, endsegment, whitelist) =>{

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

        io.socket.post('/messages/subscribe/'+user.service + '/' + user.account+'?psk=' + process.env.GOSSIPMILL_PSK,{
                lang: language,
                socketid: sails.sockets.getId(req),
                depth: 5,
                filter_by:query,
                whitelist: whitelist
            },function(data){
                // console.log(data.room);
            //subscribe to this roomname
            sails.sockets.join(req.socket,data.room);
            // io.socket.off(data.room, function(){
                if (!sockethandlers[data.room])
                {
                    sockethandlers[data.room] = function(msg){
                        sails.log.info(msg.message_id);
                        sails.sockets.broadcast(data.room, msg);
                    };
                    io.socket.on(data.room,sockethandlers[data.room]);
                }
            });
        // });

        return {
            scope:{
                class:klass,
                content: contentid,
                startsegment: startsegment,
                endsegment: endsegment
            },
            msg:'Subscribed'
        };
    },

    unsubscribe: (socket)=>
    {
        delete sockethandlers['query-'+socket.id];
        io.socket.post('/messages/unsubscribe/?psk=' + process.env.GOSSIPMILL_PSK,{
            socketid:socket.id
        },()=>{
            sails.log.verbose('Unsubscribed',socket.id);
        });
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
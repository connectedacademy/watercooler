// let sailsio = require('socket.io-client')(process.env.GOSSIPMILL_URL);
var socketIOClient = require('socket.io-client');
var sailsIOClient = require('sails.io.js');
var io = sailsIOClient(socketIOClient);
io.sails.environment = 'production';
io.sails.url = process.env.GOSSIPMILL_URL;
io.sails.reconnection = true;
io.sails.initialConnectionHeaders = { nosession: true };

io.socket.on('connect', function () {
    sails.log.info('Gossipmill API Socket Connected');
});

io.socket.on('disconnect', function () {
    sails.log.info('Gossipmill API Socket disconnect');
});

io.socket.on('reconnect', function () {
    sails.log.info('Gossipmill API Socket reconnect');
});

io.socket.on('reconnect_attempt', function () {
    sails.log.info('Gossipmill API Socket reconnect_attempt');
});

io.socket.on('reconnecting', function (num) {
    sails.log.error('Gossipmill API Socket reconnecting', num);
});

let requestBase = require('request-promise-native');
let request = requestBase.defaults({
    pool: {maxSockets: 1024}
});

let baseURI = process.env.GOSSIPMILL_URL;

let sockethandlers = {};

module.exports = {

    visualisation: async (course, klass, content, language, whitelist, groupby, justmine) => {
        let query = {
            lang: language,
            whitelist: whitelist,
            group_by: {
                name: 'segment'
            },
            filter_by: [
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
        };

        if (justmine)
        {
            query.filter_by.push({
                name:'user',
                query: justmine
            });
        }

        let response = await request({
            url: baseURI + 'messages/visualisation',
            method: 'POST',
            json: true,
            body: query,
            qs: {
                psk: process.env.GOSSIPMILL_PSK
            }
        });

        let min = 0;
        let max = parseInt(_.max(response, 'segment').segment);

        let ordered = {};

        for (let i = min; i <= max; i++) {
            let seg = _.find(response, { segment: i + '' });
            let realindex = i / groupby | 0;
            if (!ordered[realindex])
                ordered[realindex] = 0;

            if (seg)
                ordered[realindex] += seg.count;
        }

        let max_val = _.max(_.values(ordered));

        ordered = _.mapValues(ordered, (o) => {
            return (o / max_val).toFixed(3);
        });

        let maxk = _.size(ordered) - 1;

        let nordered = _.mapKeys(ordered, (v, k) => {
            return k / maxk;
        });

        return nordered;
    },

    totals: async (course, klass, content, justmine) => {
        let query = {
            group_by: {
                name: 'tag'
            },
            filter_by: [
                {
                    name: 'course',
                    query: course
                },
                {
                    name: 'tag',
                    query: klass + '/' + content
                }
            ]
        };

        if (justmine)
        {
            query.filter_by.push({
                name:'user',
                query: justmine
            });
        }

        let response = await request({
            url: baseURI + 'messages/totals',
            method: 'POST',
            json: true,
            body: query,
            qs: {
                psk: process.env.GOSSIPMILL_PSK
            }
        });
        return response;
    },

    allTotals: async (course) => {
        let response = await request({
            url: baseURI + 'messages/totals',
            method: 'POST',
            json: true,
            body: {
                group_by: {
                    name: 'tag'
                },
                filter_by: [
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

    allTotalsForUser: async (course, user) => {
        let response = await request({
            url: baseURI + 'messages/totals',
            method: 'POST',
            json: true,
            body: {
                group_by: {
                    name: 'tag'
                },
                filter_by: [
                    {
                        name: 'course',
                        query: course
                    },
                    {
                        name: 'user',
                        query: user
                    }
                ]
            },
            qs: {
                psk: process.env.GOSSIPMILL_PSK
            }
        });
        return response;
    },

    summary: async (course, klass, user, language, contentid, startsegment, endsegment, whitelist, justmine) => {
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

        if (justmine)
        {
            query.push({
                name: 'user',
                query: justmine
            })
        }

        for (let i = parseInt(startsegment); i <= parseInt(endsegment); i++) {
            query.push({
                name: 'segment',
                query: i
            });
        }

        // sails.log.verbose('Requesting summary');

        let response = await request({
            url: baseURI + 'messages/summary/' + user.service + '/' + user.account,
            method: 'POST',
            json: true,
            body: {
                whitelist: whitelist,
                filter_by: query,
                lang: language
            },
            qs: {
                psk: process.env.GOSSIPMILL_PSK
            }
        });

        return response;
    },

    listForUsers: async (course, klass, user, userlist, whitelist) => {
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
                name: 'segment',
                query: '*'
            },
            {
                name: 'replyto',
                query: '*'
            }
        ];

        for (let u of userlist)
        {
            query.push({
                name:'user',
                query: u
            });
        }

        let response = await request({
            url: baseURI + 'messages/list/' + user.service + '/' + user.account,
            method: 'POST',
            json: true,
            body: {
                filter_by: query,
                whitelist: whitelist,
                depth: 100,
                lang: '*'
            },
            qs: {
                psk: process.env.GOSSIPMILL_PSK
            }
        });

        return response;
    },

    listForUserForClass: async (course, klass, user, whitelist, filteruser) => {

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
                name: 'user',
                query: filteruser
            },
            {
                name: 'replyto',
                query: '*'
            }
        ];

        let response = await request({
            url: baseURI + 'messages/list/' + user.service + '/' + user.account,
            method: 'POST',
            json: true,
            body: {
                filter_by: query,
                whitelist: whitelist,
                depth: 100,
                lang: '*'
            },
            qs: {
                psk: process.env.GOSSIPMILL_PSK
            }
        });

        return response;
    },

    listForUser: async (course, user, whitelist, filteruser) => {

        let query = [
            {
                name: 'course',
                query: course
            },
            {
                name: 'user',
                query: filteruser
            },
            {
                name: 'replyto',
                query: '*'
            }
        ];

        let response = await request({
            url: baseURI + 'messages/list/' + user.service + '/' + user.account,
            method: 'POST',
            json: true,
            body: {
                filter_by: query,
                whitelist: whitelist,
                depth: 100,
                lang: '*'
            },
            qs: {
                psk: process.env.GOSSIPMILL_PSK
            }
        });

        return response;
    },

    list: async (course, klass, user, language, contentid, startsegment, endsegment, depth, whitelist, justmine) => {
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
            },
            {
                name: 'replyto',
                query: 'null'
            }
        ];

        if (justmine)
        {
            query.push({
                name: 'user',
                query: justmine
            })
        }

        for (let i = parseInt(startsegment); i <= parseInt(endsegment); i++) {
            query.push({
                name: 'segment',
                query: i
            });
        }

        let response = await request({
            url: baseURI + 'messages/list/' + user.service + '/' + user.account,
            method: 'POST',
            json: true,
            body: {
                filter_by: query,
                whitelist: whitelist,
                depth: depth || 10,
                lang: language
            },
            qs: {
                psk: process.env.GOSSIPMILL_PSK
            }
        });

        return response;
    },

    listcontent: async (course, klass, user, language, contentid, depth, whitelist, justmine) => {
        let query = [
            {
                name: 'course',
                query: course
            },
            {
                name: 'tag',
                query: klass + '/' + contentid
            },
            {
                name: 'replyto',
                query: 'null'
            }
        ];

        if (justmine)
        {
            query.push({
                name: 'user',
                query: justmine
            })
        }

        let response = await request({
            url: baseURI + 'messages/list/' + user.service + '/' + user.account,
            method: 'POST',
            json: true,
            body: {
                filter_by: query,
                whitelist: whitelist,
                depth: depth || 10,
                lang: language
            },
            qs: {
                psk: process.env.GOSSIPMILL_PSK
            }
        });

        return response;
    },

    subscribeToClass: async (req, course, klass, user, language, classroom) =>{
        
        let klassroom = classroom;

        let query = [
            {
                name: 'course',
                query: course
            },
            {
                name: 'class',
                query: klass
            }
        ];

        io.socket.post('/messages/subscribe/'+user.service + '/' + user.account+'?psk=' + process.env.GOSSIPMILL_PSK,{
                lang: language,
                socketid: sails.sockets.getId(req),
                depth: 5,
                filter_by:query,
                whitelist: true
            },function(data){
            
            let klass2 = klassroom;

            // console.log(data.room);
            //subscribe to this roomname
            sails.sockets.join(req.socket,data.room);
            // io.socket.off(data.room, function(){
            if (!sockethandlers[data.room])
            {
                sockethandlers[data.room] = async function(msg){
                    let classroom = klass2;

                    let wrapped = {
                        msgtype: 'message',
                        msg: msg
                    };
                    wrapped.msg.author = wrapped.msg.user;
                    // check if this user is in the classroom:
                    let klassroom = await Classroom.findOne({code:classroom});
                    if (_.includes(klassroom.students, wrapped.msg.author.id))
                    {
                        sails.log.silly("Broadcasting Socket message into classroom with " + msg.message_id);
                        sails.sockets.broadcast(data.room, wrapped);
                    }
                };
                io.socket.on(data.room,sockethandlers[data.room]);
            }
        });
        // });

        return {
            scope:{
                class:klass
            },
            msg:'Subscribed'
        };
    },

    subscribecontent: async (req, course, klass, user, language, contentid, whitelist, justmine) => {

        let query = [
            {
                name: 'course',
                query: course
            },
            {
                name: 'tag',
                query: klass + '/' + contentid
            }
        ];

        if (justmine)
        {
            query.push({
                name: 'user',
                query: justmine
            })
        }

        io.socket.post('/messages/subscribe/' + user.service + '/' + user.account + '?psk=' + process.env.GOSSIPMILL_PSK, {
            lang: language,
            socketid: sails.sockets.getId(req),
            depth: 5,
            filter_by: query,
            whitelist: whitelist
        }, function (data) {
            // console.log(data.room);
            //subscribe to this roomname
            sails.sockets.join(req.socket, data.room);
            // io.socket.off(data.room, function(){
            if (!sockethandlers[data.room]) {
                sockethandlers[data.room] = function (msg) {
                    let wrapped = {
                        msgtype: 'message',
                        msg: msg
                    };
                    wrapped.msg.author = wrapped.msg.user;
                    sails.log.silly("Broadcasting Socket message with " + msg.message_id);
                    sails.sockets.broadcast(data.room, wrapped);
                };
                io.socket.on(data.room, sockethandlers[data.room]);
            }
        });
        // });

        return {
            scope: {
                class: klass,
                content: contentid
            },
            msg: 'Subscribed'
        };
    },

    subscribe: async (req, course, klass, user, language, contentid, startsegment, endsegment, whitelist, justmine) => {

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

        if (justmine)
        {
            query.push({
                name: 'user',
                query: justmine
            })
        }

        for (let i = parseInt(startsegment); i <= parseInt(endsegment); i++) {
            query.push({
                name: 'segment',
                query: i
            })
        }

        // console.log(query);

        io.socket.post('/messages/subscribe/' + user.service + '/' + user.account + '?psk=' + process.env.GOSSIPMILL_PSK, {
            lang: language,
            socketid: sails.sockets.getId(req),
            depth: 5,
            filter_by: query,
            whitelist: whitelist
        }, function (data) {
            // console.log(data.room);
            //subscribe to this roomname
            sails.sockets.join(req.socket, data.room);
            // io.socket.off(data.room, function(){
            if (!sockethandlers[data.room]) {
                sockethandlers[data.room] = function (msg) {
                    let wrapped = {
                        msgtype: 'message',
                        msg: msg
                    };
                    wrapped.msg.author = wrapped.msg.user;
                    sails.log.silly("Socket message with " + msg.message_id);
                    sails.sockets.broadcast(data.room, wrapped);
                };
                io.socket.on(data.room, sockethandlers[data.room]);
            }
        });
        // });

        return {
            scope: {
                class: klass,
                content: contentid,
                startsegment: startsegment,
                endsegment: endsegment
            },
            msg: 'Subscribed'
        };
    },

    unsubscribe: (socket) => {
        delete sockethandlers['query-' + socket.id];
        io.socket.post('/messages/unsubscribe/?psk=' + process.env.GOSSIPMILL_PSK, {
            socketid: socket.id
        }, () => {
            sails.log.verbose('Unsubscribed', socket.id);
        });
    },

    create: async (credentials, user, message) => {
        let response = await request({
            url: baseURI + 'messages/create',
            method: 'POST',
            json: true,
            body: {
                text: message.text,
                replyto: message.replyto,
                retweet: message.retweet,
                credentials: {
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
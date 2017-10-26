// let sailsio = require('socket.io-client')(process.env.GOSSIPMILL_URL);
let md5 = require('md5');
let socketIOClient = require('socket.io-client');
let sailsIOClient = require('sails.io.js');
let io = sailsIOClient(socketIOClient);
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

let redis = require('redis');
let rediscache = redis.createClient({
    host: process.env.REDIS_HOST,
    port: process.env.REDIS_PORT,
    db:2
});
let Promise = require('bluebird');
Promise.promisifyAll(redis.RedisClient.prototype);

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

        let processing = function(response){
            
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
        };

        let params = {
            url: baseURI + 'messages/visualisation',
            method: 'POST',
            json: true,
            body: query,
            qs: {
                psk: process.env.GOSSIPMILL_PSK
            }
        };

        let key = `${md5(query)}`;

        let results = await ResponseCache.cachedRequest('visualisation', key, params, 10, processing);

        return results;
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

        let params = {
            url: baseURI + 'messages/totals',
            method: 'POST',
            json: true,
            body: query,
            qs: {
                psk: process.env.GOSSIPMILL_PSK
            }
        };

        let key = `${md5(query)}`;

        let response = await ResponseCache.cachedRequest('totals',key, params, 10);

        return response;
    },

    allTotals: async (course) => {

        let query = {
            group_by: {
                name: 'tag'
            },
            filter_by: [
                {
                    name: 'course',
                    query: course
                }
            ]
        };

        let params = {
            url: baseURI + 'messages/totals',
            method: 'POST',
            json: true,
            body: query,
            qs: {
                psk: process.env.GOSSIPMILL_PSK
            }
        };

        let key = `${md5(query)}`;

        let response = await ResponseCache.cachedRequest('alltotals',key, params, 10);

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
        let queryKey = [
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

        for (let i = parseInt(startsegment); i <= parseInt(endsegment); i++) {
            queryKey.push({
                name: 'segment',
                query: i
            });
        }

        let query = _.clone(queryKey);

        if (justmine)
        {
            query.push({
                name: 'user',
                query: justmine
            })
        }

        let params = {
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
        };

        let segments = _.pluck(_.filter(queryKey,{name:'segment'}),'query');

        let userkey = `wc:summary:${course}:${klass}:${contentid}:|${segments.join('|')}|:${user.service}/${user.account}`;

        
        //get redis with this user spec key:



        //if there is a key, then serve it
        let usersubmittedinthisblock = await ResponseCache.getFromKey(userkey);
        //if there is not a key, then serve the main response

        //TODO:
        // if this user has submitted a message in this block then their view will be different to everyone else's -- go get the real data (or a cached version)
        if (usersubmittedinthisblock)
        {
            return usersubmittedinthisblock;
        }
        else
        {
            // use the existing cache (which will get invalidated when ANYONE posts to this block)
            let key = `${course}:${klass}:${contentid}:|${segments.join('|')}|:${language}:${whitelist}`;

            let response = await ResponseCache.cachedRequest('summary',key, params, 60);

            //TODO:
            if (response.data.message && response.data.message.ismine)
            {
                // set the user submitted key:
                ResponseCache.setCache(userkey, response);
            }

            return response;
        }
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

        //TODO:
        // invalidate all redis cache which match the obtained criteria from this link:
        let tokens = [
            {
                "name": "course",
                "regex": "https:\/\/(.*\\.connectedacademy\\.io)\\.*",
                "compositeindex":true
            },
            {
                "name": "class",
                "regex": "https:\/\/.*\\.connectedacademy\\.io\/#\/course\/(.*)\/.*\/.*$",
                "compositeindex":true
            },
            {
                "name": "content",
                "regex": "https:\/\/.*\\.connectedacademy\\.io\/#\/course\/.*\/(.*)\/.*$",
                "compositeindex":true
            },
            {
                "name": "segment",
                "regex": "https:\/\/.*\\.connectedacademy\\.io\/#\/course\/.*\/.*\/(.*)$",
                "compositeindex":true
            }
        ];

        let parsed = {};

        for (let token of tokens)
        {
            // try find the token
            let regex = new RegExp(token.regex.replace("\\\\", "\\"));
    
            let results = regex.exec(message.text);
            if (results) {
                let result = results[1];
                // if the token is found, then find or create node for it
                try {
                    parsed[token.name] = result.replace('/', '\/');
                    sails.log.verbose("Created Token Relationship", token.name, result);
                }
                catch (e) {
                    sails.log.error(e);
                }
            }
            else {
                sails.log.silly('Regex not found in string', token.regex, message.text);
            }
        }

        // console.log(parsed);
        //caches which include this segment

        //remove anything matching the summary endpoint which includes this segment
        let pattern = `wc:summary:${parsed.course}:${parsed.class}:${parsed.content}:*|${parsed.segment}|*:*`;
        await ResponseCache.removeMatching(pattern);

        //caches which are based on this specific user
        //invalidate segment user cache let userkey = `${course}:${klass}:${contentid}:|${segments.join('|')}|:${user.service}/${user.account}`;
        pattern = `wc:summary:${parsed.course}:${parsed.class}:${parsed.content}:*|${parsed.segment}|*:${user.service}/${user.account}`;
        await ResponseCache.removeMatching(pattern);

        return response;
    }
}
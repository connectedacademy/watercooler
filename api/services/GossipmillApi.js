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

let baseURI = process.env.GOSSIPMILL_URL;

const DEFAULT_LIMIT = 100;
const VIS_THROTTLE = 1000;

let sockethandlers = {};
let visqueues = {};
let lastfired = {};

module.exports = {

    visualisation: async (course, klass, content, language, whitelist, groupby, limit, justmine, clearcache = false, segments=false, scale='lin') => {
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
            let max = 0;
            if (limit)
                max = limit;
            else
                max = parseInt(_.max(response, 'segment').segment);

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
            
            let max_val_log = Math.max(Math.log(_.max(_.values(ordered))),Math.log(10));

            // console.log(max_val_log);

            let yoffset = 1;

            ordered = _.mapValues(ordered, (o) => {
                switch(scale)
                {
                    case 'raw':
                        return o;
                    case 'log':
                    if (o == 0)
                        return 0;
                    else
                        return +(((Math.log(o) + yoffset) / (max_val_log + yoffset))).toFixed(3);
                    case 'lin':
                    default:
                        return +(o / max_val).toFixed(3);
                }  
            });

            let maxk = _.size(ordered) - 1;

            let nordered = _.mapKeys(ordered, (v, k) => {
                if (segments)
                    return k * groupby;
                else
                    return (k / maxk);
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

        let key = `${md5(_.extend(query,{limit:limit}))}`;

        let results = await ResponseCache.cachedRequest('visualisation', key, params, 10, processing, clearcache);

        return results;
    },

    totals: async (course, klass, content, justmine, clearcache=false) => {
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

        let response = await ResponseCache.cachedRequest('totals',key, params, 10, null, clearcache);

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

    summary: async (course, klass, user, language, contentid, startsegment, endsegment, whitelist, justmine, loggedin) => {
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

        
        // console.log(userkey);
        //get redis with this user spec key:

        //if there is a key, then serve it

        //if logged in:
        if (loggedin)
        {
            //if there is a cache of the user submitting into this block:
            let userblockcache = await ResponseCache.getFromKey(userkey);
            if (userblockcache)
            {
                // console.log('user in block cache - ' + user.account);
                return userblockcache;
            }
            else
            {
                //lookup if this user has submitted int this block range (from redis, never invalidates) -- this gets pregenerates on boot, and updated on message submit

                let commands = [];
                for (let segment = parseInt(startsegment); segment <= parseInt(endsegment); segment++) 
                {
                    // console.log(`wc:lookup:${course}:${klass}:${contentid}:${segment}:${user.id}`);
                    commands.push(['get',`wc:lookup:${course}:${klass}:${contentid}:${segment}:${user.id}`]);
                }

                let possibles = await ResponseCache.pipeline(commands);
        
                // console.log(possibles);

                // lookup says that this user has submitted into this block
                if (_.includes(_.flatten(possibles),'true'))
                {
                    // console.log('is in lookup');
                    //if the user has submitted, then do query without cache:
                    let response = await ResponseCache.cachedRequest('summary',userkey, params, -1, null, true);
                    //if this message belongs to me -- set this cache for the next time:
                    // if (response.data.message && response.data.message.ismine)
                    // {
                        // set the user submitted key:
                    ResponseCache.setCache(userkey, response);
                    return response;
                    // }
                }
            }
        }
        //if there is not a key, then serve the main response
        
        let key = `${course}:${klass}:${contentid}:|${segments.join('|')}|:${language}:${whitelist}`;
        // use the existing cache (which will get invalidated when ANYONE posts to this block)

        let response = await ResponseCache.cachedRequest('summary',key, params, -1);
        // console.log("from cache");

        if (response.data.message)
        {
            response.data.message.ismine = 0;
            if (response.data.message.author)
            {
                if (user.id == response.data.message.author.id)
                    response.data.message.ismine = 1;
                else
                    response.data.message.ismine = 0;
            }
        }

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
                depth: DEFAULT_LIMIT,
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
            },
            {
                name: 'segment',
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
                depth: DEFAULT_LIMIT,
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
                depth: DEFAULT_LIMIT,
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
                depth: depth || DEFAULT_LIMIT,
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
                depth: depth || DEFAULT_LIMIT,
                lang: language
            },
            qs: {
                psk: process.env.GOSSIPMILL_PSK
            }
        });

        return response;
    },

    //Create subscribe connection for a shared 'room'
    subscribeToVis: async (req, course, klass, content, language, user, justmine) =>{

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
                query: content
            }
        ];

        if (justmine)
        {
            query.push({
                name: 'user',
                query: justmine
            })
        }

        let socketid = `${course}-${klass}-${content}`;

        io.socket.post(`/messages/subscribe/${user.service}/${user.account}?psk=${process.env.GOSSIPMILL_PSK}`,{
                lang: language,
                socketid: socketid,
                depth: DEFAULT_LIMIT,
                filter_by:query,
                whitelist: true
            },function(data){

            //subscribe to this roomname
            sails.sockets.join(req.socket,data.room);

            if (sockethandlers[data.room])
                io.socket.off(data.room,sockethandlers[data.room]);

            // io.socket.off(data.room, function(){
            if (!visqueues[data.room])
                visqueues[data.room] = [];

            if (!sockethandlers[data.room])
            {
                sockethandlers[data.room] = async function(msg){

                    sails.log.verbose("Incoming vis msg " + msg.message_id);                    

                    let wrapped = {
                        msgtype: 'visupdate',
                        msg: _.pick(msg,['updatedAt','class','content','segment','user.id'])
                    };
                    
                    visqueues[data.room].push(wrapped);

                    let NOW = new Date().getTime();
                    if ((NOW - (lastfired[data.room]||0)) > VIS_THROTTLE)
                    {
                        sails.log.verbose("VisEvent",`Broadcasting Socket message into visualisation ${data.room}`);
                        sails.sockets.broadcast(data.room, visqueues[data.room]);
                        lastfired[data.room] = NOW;
                        visqueues[data.room] = [];
                    }
                };
            }

            io.socket.on(data.room,sockethandlers[data.room]);
        });

        return {
            scope:{
                class:klass,
                content: content
            },
            msg:'Subscribed to Vis Updates'
        };
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
                depth: DEFAULT_LIMIT,
                filter_by:query,
                whitelist: true
            },function(data){
            
            let klass2 = klassroom;

            // console.log(data.room);
            //subscribe to this roomname
            sails.sockets.join(req.socket,data.room);

            if (sockethandlers[data.room])
                io.socket.off(data.room,sockethandlers[data.room]);

            // io.socket.off(data.room, function(){

            sockethandlers[data.room] = async function(msg){
                let classroom = klass2;

                let wrapped = {
                    msgtype: 'message',
                    msg: msg
                };
                wrapped.msg.author = wrapped.msg.user;
                delete wrapped.msg.user;
                // check if this user is in the classroom:
                let klassroom = await Classroom.findOne({code:classroom});

                // console.log(klassroom);
                // console.log(wrapped.msg.author.id);
                if (_.includes(klassroom.students, wrapped.msg.author.id.toString()))
                {
                    sails.log.silly("Broadcasting Socket message into classroom with " + msg.message_id);
                    sails.sockets.broadcast(data.room, wrapped);
                }
            };

            // if (!sockethandlers[data.room])
            // {
            io.socket.on(data.room,sockethandlers[data.room]);
            // }
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
            depth: DEFAULT_LIMIT,
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
                    delete wrapped.msg.user;            
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
            depth: DEFAULT_LIMIT,
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
                    delete wrapped.msg.user;
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

        //create lookup for this user:
        let lookupkey = `wc:lookup:${parsed.course}:${parsed.class}:${parsed.content}:${parsed.segment}:${user.id}`;
        ResponseCache.setCache(lookupkey,true);


        // console.log("MESSAGE CREATED");

        return response;
    }
}
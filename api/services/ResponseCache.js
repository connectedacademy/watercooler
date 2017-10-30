let redis = require('redis');
let RedisIO = require('ioredis');
let redisIO = new RedisIO(process.env.REDIS_PORT, process.env.REDIS_HOST, {
    db: 2
}); //new Redis(6379, '192.168.1.1')

let rediscache = redis.createClient({
    host: process.env.REDIS_HOST,
    port: process.env.REDIS_PORT,
    db: 2
});
let Promise = require('bluebird');
Promise.promisifyAll(redis.RedisClient.prototype);

let md5 = require('md5');
let requestBase = require('request-promise-native');
let request = requestBase.defaults({
    pool: { maxSockets: 1024 }
});

module.exports = {

    getFromKey: async function (key) {
        try {
            sails.log.silly('Attempting to find ' + key);
            let resp = JSON.parse(await rediscache.getAsync(key));
            return resp;
        }
        catch (e) {
            return false;
        }
    },

    setCache: async function (key, data) {
        try {
            rediscache.set(key, JSON.stringify(data));
            sails.log.silly('Written ' + key);
        }
        catch (e) {
            return false;
        }
    },

    cachedRequest: async function (route, keyIn, params, ttl, processing = null, clearcache = false) {
        
        let key = `wc:${route}:${keyIn}`;

        if (clearcache) {
            sails.log.silly('Forcing no cache for', keyIn, params, ttl);
            let results = await request(params);
            if (processing)
                results = processing(results);

            //if succeeds, put in cache
            rediscache.set(key, JSON.stringify(results));
            rediscache.expire(key, ttl); //60 seconds
            return results;
        }
        else {

            sails.log.silly('Attempting Redis Cache for', keyIn, params, ttl);

            try {
                let resp = await rediscache.getAsync(key);
                if (resp) {
                    sails.log.silly('Using redis cache for ' + key);
                    return JSON.parse(resp);
                }
                else {
                    sails.log.silly('Running query for ' + key);

                    let results = await request(params);

                    if (processing)
                        results = processing(results);

                    //if succeeds, put in cache
                    rediscache.set(key, JSON.stringify(results));
                    rediscache.expire(key, ttl); //60 seconds
                    return results;
                }
            }
            catch (e) {
                sails.log.error(e);
                throw new Error("No live data or cache available for " + key);
            }
        }
    },

    removeMatching: function (keyPattern) {

        return new Promise((resolve, reject) => {
            var stream = redisIO.scanStream({
                match: keyPattern
            });
            stream.on('data', function (keys) {
                // `keys` is an array of strings representing key names
                if (keys.length) {
                    var pipeline = redisIO.pipeline();
                    keys.forEach(function (key) {
                        pipeline.del(key);
                    });
                    pipeline.exec();
                }
            });
            stream.on('end', function () {
                resolve();
            });
        });


        // return new Promise((resolve, reject) => {
        //     redisIO.keys(`${keyPattern}:*`).then(function (keys) {
        //         // Use pipeline instead of sending
        //         // one command each time to improve the
        //         // performance.
        //         var pipeline = redisIO.pipeline();
        //         keys.forEach(function (key) {
        //             pipeline.del(key);
        //         });
        //         resolve(pipeline.exec());
        //     });
        // });
    }
}
let redis = require('redis');
let RedisIO = require('ioredis');
let redisIO = new RedisIO(process.env.REDIS_PORT, process.env.REDIS_HOST, {
    db: 2
});

let rediscache = redis.createClient({
    host: process.env.REDIS_HOST,
    port: process.env.REDIS_PORT,
    db: 2
});

let Promise = require('bluebird');
Promise.promisifyAll(redis.RedisClient.prototype);

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

    deleteKey: async function (key) {
        try {
            sails.log.silly('Deleting key ' + key);
            await rediscache.delAsync(key);
        }
        catch (e) {
            return false;
        }
    },

    pipeline: async function(commands){
        return redisIO.pipeline(commands).exec();
    },

    setCache: async function (key, data) {
        try {
            sails.log.silly('Written ' + key);
            await rediscache.setAsync(key, JSON.stringify(data));
        }
        catch (e) {
            return Promise.resolve(false);
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
            await rediscache.setAsync(key, JSON.stringify(results));
            await rediscache.expireAsync(key, ttl); //60 seconds
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
                    await rediscache.setAsync(key, JSON.stringify(results));
                    if (ttl>0)
                        await rediscache.expireAsync(key, ttl); //60 seconds

                    return results;
                }
            }
            catch (e) {
                sails.log.error('CacheFaile',e);
                throw new Error("No live data or cache available for " + key);
            }
        }
    },

    removeMatching: function (keyPattern) {

        return new Promise((resolve) => {

            let keystorem = [];

            var stream = redisIO.scanStream({
                match: keyPattern
            });
            stream.on('data', async function (keys) {
                // `keys` is an array of strings representing key names
                // console.log("data",keys.length); 

                keystorem.push(keys);


            });
            stream.on('end', async function () {
                console.log("stream ended"); 

                if (keystorem.length) {
                    var pipeline = redisIO.pipeline();
                    keystorem.forEach(function (key) {
                        pipeline.del(key);
                    });
                    await pipeline.exec();
                }
                
                resolve();
            });
        });
    }
}
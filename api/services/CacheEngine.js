let yaml = require('js-yaml');
let fs = require('fs-promise');
let requestify = require('requestify');
let redis = require('redis');
let rediscache = redis.createClient({
  host: process.env.REDIS_HOST,
  port: process.env.REDIS_PORT
})
requestify.cacheTransporter(requestify.coreCacheTransporters.redis(rediscache));

//TODO: cache response from the github to prevent backlog
//TODO: replace with real data

module.exports = {

    //TODO: -- only cache validated YAML response from the server, to make sure a bad version is not cached.

    get: async (uri, req, res)=>{
        let response = await requestify.get(uri,{
            cache: true
        });
        return response.body;
    },

    getHubs: async (req,res)=>{
        sails.log.verbose('Should be getting ' + req.course.url + '/config/hubs.yaml, actually serving examples/hubs.yaml');
        let raw = await fs.readFile(__dirname + '/../../spec/examples/hubs.yaml');
        return yaml.safeLoad(raw);
    },

    getSpec: async (req,res) => {
        // console.log(req.course);
        sails.log.verbose('Should be getting ' + req.course.url + '/config/spec.yaml, actually serving examples/spec.yaml');
        let raw = await fs.readFile(__dirname + '/../../spec/examples/spec.yaml');
        return yaml.safeLoad(raw);
    },

    dummyData: async (file) =>{
        let raw = await fs.readFile(__dirname + '/../../spec/examples/' + file);
        return raw;
    }
}
let yaml = require('js-yaml');
let fs = require('fs-promise');
let requestify = require('requestify');
let redis = require('redis');
let rediscache = redis.createClient({
  host: process.env.REDIS_HOST,
  port: process.env.REDIS_PORT
});
let Promise = require('bluebird');
Promise.promisifyAll(redis.RedisClient.prototype);
let frontmatter = require('front-matter');

requestify.cacheTransporter(requestify.coreCacheTransporters.redis(rediscache));
let get =  async (uri)=>{
    let response = await requestify.get(uri,{
        cache: true
    });
    return response.body;
};

module.exports = {

    getFrontmatter : async (url, content=false)=>
    {
        sails.log.verbose('Getting ' + url);    
        //get from remote
        let raw = await get(url);
        try
        {
            let fm = frontmatter(raw);
            if (content)
                return fm;
            else
                return fm.attributes;
        }
        catch (e)
        {
            return {};
        }
    },

    getEmail : async (req, email_type) =>
    {
        let url = req.course.url + '/course/content/' + LangService.lang(req) + '/emails/' + email_type + '.md';
        sails.log.verbose('Getting Email ' + email_type, url);
        //get file
        let email = CacheEngine.getFrontMatter(url,true);
        //parse markdown, title etc
        return {
            subject: email.attributes.title,
            body: email
        };
    },

    getYaml : async (url) =>
    {
        sails.log.verbose('Getting ' + url);    
        try
        {
            //get from remote
            let raw = await get(url);
            //try load yaml
            let yml = yaml.safeLoad(raw);
            //if succeeds, put in cache
            rediscache.set("ymlcache:" + url, JSON.stringify(yml));
            return yml;
        }
        catch (e)
        {
            //if fails (network, invalid update), try load from cache
            let resp = await rediscache.getAsync("ymlcache:" + url)
            if (resp)
                return JSON.parse(resp);
            else
            {
                //if no cache, fail
                sails.log.error(e);
                throw new Error("No live data or cache available for " + url);
            }
        }
    },

    getHubs: async (req,res)=>{
        if (process.env.LIVE_DATA=='true')
        {
            return CacheEngine.getYaml(req.course.url + '/course/config/hubs.yaml');
        }
        else
        {
            sails.log.verbose('Should be getting ' + req.course.url + '/course/config/hubs.yaml, actually serving examples/hubs.yaml');
            let raw = await fs.readFile(__dirname + '/../../spec/examples/hubs.yaml');
            return yaml.safeLoad(raw);
        }
    },

    getSpec: async (req,res) => {
        if (process.env.LIVE_DATA=='true')
        {
            return CacheEngine.getYaml(req.course.url + '/course/config/spec.yaml');            
        }
        else
        {
            sails.log.verbose('Should be getting ' + req.course.url + '/course/config/spec.yaml, actually serving examples/spec.yaml');
            let raw = await fs.readFile(__dirname + '/../../spec/examples/spec.yaml');
            return yaml.safeLoad(raw);
        }
    },

    getQuestions: async (req,res) => {
        let lang = await LangService.lang(req);
        if (process.env.LIVE_DATA=='true')
        {
            return CacheEngine.getYaml(req.course.url + '/course/config/questions/' + lang + '.yaml');
        }
        else
        {
            // console.log(req.course);
            sails.log.verbose('Should be getting ' + req.course.url + '/course/config/questions.yaml, actually serving examples/questions.yaml');
            let raw = await fs.readFile(__dirname + '/../../spec/examples/questions.yaml');
            return yaml.safeLoad(raw);
        }
    },

    dummyData: async (file) =>{
        let raw = await fs.readFile(__dirname + '/../../spec/examples/' + file);
        return raw;
    }
}
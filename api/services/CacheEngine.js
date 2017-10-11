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
let showdown = require('showdown');
let markdownconverter = new showdown.Converter();
let moment = require('moment');

requestify.cacheTransporter(requestify.coreCacheTransporters.redis(rediscache));

let get = async (uri) => {
    let response = await requestify.get(uri, {
        cache:
        {
            cache: true
        }
    });
    return response.body;
};

module.exports = {

    applyFrontMatter: async (data, uri, course, user, klass, content) => {
        let courseinfo = await CacheEngine.getFrontmatter(uri,true);
        _.extend(data, courseinfo.attributes);
        data.hasContent = courseinfo.body != '';
        delete data.published;
        if (data.video)
            delete data.url;
        if (data.expectsubmission && user) {
            let submissions = await Submission.find({
                course: course,
                class: klass,
                content: content,
                user: user
            });
            data.submissions = submissions;
        }
    },

    getSegmentWithHub: function (segment, hub) {
        let hubinfo = _.find(segment.schedule, { hub_id: hub });
        if (!hubinfo && _.size(segment.schedule) > 1)
            hubinfo = _.find(segment.schedule, { leadhub: true });
        else
            hubinfo = _.first(segment.schedule);

        return moment(hubinfo.release_at);
    },

    getLiveSegment: function (klass) {
        let livesegment = _.find(klass.content, (k) => {
            return _.has(k, 'schedule');
        });

        if (livesegment) {
            //get earliest timestamp:
            let times = _.map(livesegment.schedule, (s) => {
                return moment(s.release_at);
            });

            let ordered_times = times.sort();
            let start = _.first(ordered_times);
            let Wstart = moment(start);
            return Wstart;
        }
        else {
            return null;
        }
    },

    getSchedForHub: function (segment, hub) {
        let hubinfo = _.find(segment.schedule, { hub_id: hub });
        if (!hubinfo && _.size(segment.schedule) > 1)
            hubinfo = _.find(segment.schedule, { leadhub: true });
        else
            hubinfo = _.first(segment.schedule);

        return hubinfo;
    },

    getSubs: async (url) => {
        let raw = await get(url);
        return JSON.parse(raw);
    },

    getFrontmatter: async (url, content = false) => {
        sails.log.silly('Getting ' + url);
        //get from remote
        let raw = await get(url);
        try {
            let fm = frontmatter(raw);
            if (content)
                return fm;
            else
                return fm.attributes;
        }
        catch (e) {
            return {};
        }
    },

    getEmail: async (course, lang, email_type) => {
        // let lang = await LangService.lang(req);
        let url = course.url + '/course/content/' + lang + '/emails/' + email_type + '.md';
        sails.log.silly('Getting Email ' + email_type, url);
        //get file
        let email = await CacheEngine.getFrontmatter(url, true);
        //parse markdown, title etc
        return {
            subject: email.attributes.title,
            body: markdownconverter.makeHtml(email.body)
        };
    },

    getYaml: async (url) => {
        sails.log.silly('Getting ' + url);

        try
        {
            let resp = await rediscache.getAsync("ymlcache:" + url);
            if (resp)
            {
                sails.log.silly('Using redis cache for ' + url);
                return JSON.parse(resp);
            }
            else
            {
                sails.log.silly('Getting original file ' + url);
                
                let raw = await get(url);
                //try load yaml
                let yml = yaml.safeLoad(raw);
                //if succeeds, put in cache
                rediscache.set("ymlcache:" + url, JSON.stringify(yml));
                return yml;
            }
        }
        catch (e) {
            sails.log.error(e);
            throw new Error("No live data or cache available for " + url);
        }
    },

    getHubs: async (req) => {
        if (process.env.LIVE_DATA == 'true') {
            return CacheEngine.getYaml(req.course.url + '/course/config/hubs.yaml');
        }
        else {
            sails.log.silly('Should be getting ' + req.course.url + '/course/config/hubs.yaml, actually serving examples/hubs.yaml');
            let raw = await fs.readFile(__dirname + '/../../spec/examples/hubs.yaml');
            return yaml.safeLoad(raw);
        }
    },

    getSpec: async (req) => {
        if (process.env.LIVE_DATA == 'true') {
            return CacheEngine.getYaml(req.course.url + '/course/config/spec.yaml');
        }
        else {
            sails.log.silly('Should be getting ' + req.course.url + '/course/config/spec.yaml, actually serving examples/spec.yaml');
            let raw = await fs.readFile(__dirname + '/../../spec/examples/spec.yaml');
            return yaml.safeLoad(raw);
        }
    },

    getQuestions: async (req) => {
        let lang = await LangService.lang(req);
        if (process.env.LIVE_DATA == 'true') {
            return CacheEngine.getYaml(req.course.url + '/course/config/questions/' + lang + '.yaml');
        }
        else {
            // console.log(req.course);
            sails.log.silly('Should be getting ' + req.course.url + '/course/config/questions.yaml, actually serving examples/questions.yaml');
            let raw = await fs.readFile(__dirname + '/../../spec/examples/questions.yaml');
            return yaml.safeLoad(raw);
        }
    },

    dummyData: async (file) => {
        let raw = await fs.readFile(__dirname + '/../../spec/examples/' + file);
        return raw;
    }
}
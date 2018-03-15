var path = require('path');
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

function resolve(dir) {
  return path.join(__dirname, '..', dir)
}

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
        let courseinfo = await CacheEngine.getFrontmatter(uri, true);

        // console.log(courseinfo.attributes);

        _.extend(data, courseinfo.attributes);

        // console.log("CONTENT_TYPE");
        // console.log(data.content_type);

        data.hasContent = courseinfo.body != '';
        delete data.published;
        if (data.video)
            delete data.url;
        if (data.expectsubmission && user) {
            let submissions = await Submission.find({
                course: course,
                class: klass,
                content: content,
                user: user,
                verified: true
            });
            data.submissions = submissions;
        }
    },

    getSegmentWithHub: function (segment, hub) {
        if (segment && segment.schedule) {
            let hubinfo = _.find(segment.schedule, { hub_id: hub });
            if (!hubinfo && _.size(segment.schedule) > 1) {
                return moment(_.find(segment.schedule, { leadhub: true }).release_at);
            }
            else {
                let hubinfo = _.first(segment.schedule);
                return moment(hubinfo.release_at);
            }
        }
        else {
            return moment();
        }
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
        sails.log.verbose('Getting ' + url);
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
        sails.log.verbose('Getting Email ' + email_type, url);
        //get file
        let email = await CacheEngine.getFrontmatter(url, true);
        //parse markdown, title etc
        return {
            subject: email.attributes.title,
            body: markdownconverter.makeHtml(email.body)
        };
    },

    getYaml: async (domain,url) => {
        sails.log.verbose('Getting ' + url);

        try {
            let resp = await rediscache.getAsync(`wc:yaml:${domain}:${url}`);
            if (resp) {
                sails.log.verbose('Using redis cache for ' + url);
                return JSON.parse(resp);
            }
            else {
                sails.log.verbose('Getting original file ' + url);

                let raw = await get(url);
                //try load yaml
                let yml = yaml.safeLoad(raw);
                //if succeeds, put in cache
                rediscache.set(`wc:yaml:${domain}:${url}`, JSON.stringify(yml));
                return yml;
            }
        }
        catch (e) {
            sails.log.error('YamlCacheFail',e);
            throw new Error("No live data or cache available for " + url);
        }
    },

    getHubs: async (req) => {
        if (process.env.LIVE_DATA == 'true') {
          sails.log.verbose('Getting ' + req.course.url + '/course/config/hubs.yaml');
          return CacheEngine.getYaml(req.course.domain, req.course.url + '/course/config/hubs.yaml');
        }
        else {
          sails.log.verbose('Should be getting ' + req.course.url + '/course/config/hubs.yaml, actually serving examples/hubs.yaml');
          let raw = await fs.readFile(resolve('/../courses/example/course/config/hubs.yaml'));
            return yaml.safeLoad(raw);
        }
    },

    getSpec: async (req) => {
        if (process.env.LIVE_DATA == 'true') {
          sails.log.verbose('Getting ' + req.course.url + '/course/config/spec.yaml');
          return CacheEngine.getYaml(req.course.domain, req.course.url + '/course/config/spec.yaml');
        }
        else {
            sails.log.verbose('Should be getting ' + req.course.url + '/course/config/spec.yaml, actually serving examples/spec.yaml');
            let raw = await fs.readFile(resolve('/../courses/example/course/config/spec.yaml'));
            return yaml.safeLoad(raw);
        }
    },

    getQuestions: async (req) => {
        let lang = await LangService.lang(req);
        if (process.env.LIVE_DATA == 'true') {
          sails.log.verbose('Getting ' + req.course.url + '/course/config/questions/' + lang + '.yaml');
          return CacheEngine.getYaml(req.course.domain, req.course.url + '/course/config/questions/' + lang + '.yaml');
        }
        else {
            // console.log(req.course);
          sails.log.verbose('Should be getting ' + req.course.url + '/course/config/questions/en.yaml, actually serving examples/questions/en.yaml');
            let raw = await fs.readFile(resolve('/../courses/example/course/config/questions/en.yaml'));
            return yaml.safeLoad(raw);
        }
    },

    dummyData: async (file) => {
        let raw = await fs.readFile(resolve('/../courses/example/course/' + file));
        return raw;
    }
}
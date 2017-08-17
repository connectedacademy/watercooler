let moment = require('moment');

module.exports = {

    /**
     * 
     * @api {get} /v1/course/schedule Schedule
     * @apiDescription Get the schedule for this course
     * @apiName schedule
     * @apiGroup Course
     * @apiVersion  1.0.0
     * @apiPermission domainparse
     * 
     */
    schedule: async(req,res)=>{
        try
        {
            let lang = await LangService.lang(req);

            var data = await CacheEngine.getSpec(req,res);

            let promises = [];

            //course info:
            promises.push(CacheEngine.applyFrontMatter(data, req.course.url + '/course/content/' + lang + '/info.md'));

            //for each file in the spec, get the markdown and parse it:
            for (let klass of data.classes)
            {
                promises.push(CacheEngine.applyFrontMatter(klass, req.course.url + '/course/content/' + lang + '/' + klass.dir + '/info.md'));
            }

            await Promise.all(promises);

            //calculate release schedule
            let startdate = moment(data.starts);
            let enddate = moment(data.ends);
            let NOW = moment(req.query.time) || moment();

            if (NOW.isBetween(startdate, enddate))
                data.classrunning = true;

            // has been released or is current, or will be released
            let currentWeek = null;

            data.classes.forEach(function(klass,i)
            {
                //find element which is the live class
                let ws = CacheEngine.getLiveSegment(klass)
                if (ws)
                {
                    let Wstart = ws.clone().subtract(2,'days');
                    if (i < _.size(data.classes)-1)
                    {
                        let ls = CacheEngine.getLiveSegment(data.classes[i+1])
                        if (ls)
                        {
                            let Nstart = ls.clone().subtract(2,'days');

                            if (NOW.isBetween(Wstart,Nstart))
                            {
                                //should be this one
                                currentWeek = klass;
                            }
                        }
                    }
                }
            });
            
            let currentClass = _.indexOf(data.classes, currentWeek);

            data.classes.forEach(function(klass,i){
                if (currentClass==-1 && NOW.isAfter(enddate))
                {
                    klass.status = 'RELEASED';
                }
                else if (currentClass==-1 && NOW.isBefore(startdate))
                {
                    klass.status = 'FUTURE';
                }
                else
                {
                    if (i<currentClass)
                    {
                        klass.status = 'RELEASED';
                        let tim = CacheEngine.getLiveSegment(klass);
                        if (tim)
                        {
                            klass.release_at = tim.clone().subtract(2,'days');
                        }
                    }
                    if (i==currentClass)
                    {
                        klass.status = 'CURRENT';
                        let tim = CacheEngine.getLiveSegment(klass);
                        if (tim)
                        {
                            klass.release_at = tim.clone().subtract(2,'days');
                        }
                    }
                    if (i>currentClass)
                    {
                        klass.status = 'FUTURE';
                        let tim = CacheEngine.getLiveSegment(klass);
                        if (tim)
                        {
                            klass.release_at = tim.clone().subtract(2,'days');
                        }
                    }
                }
            });            

            data.baseUri = req.course.url + '/course/content/' + lang + '/';
            data.currentLang = lang;

            return res.json(data);
        }
        catch (e)
        {
            return res.serverError(e);
        }
    },

    /**
     * 
     * @api {get} /v1/course/spec/:class Class List
     * @apiDescription Get the content list for this class
     * @apiName spec
     * @apiGroup Course
     * @apiVersion  1.0.0
     * @apiPermission domainparse
     * 
     * @apiParam  {String} class Class slug
     * 
     */
    spec: async (req,res)=> {
        try
        {
            let k = req.param('class');

            let lang = await LangService.lang(req);

            var data = await CacheEngine.getSpec(req,res);

            let promises = [];
            
            let totals = await GossipmillApi.allTotals(req.course.domain);

            //for each file in the spec, get the markdown and parse it:
            let klass = _.find(data.classes,{slug:k});
            if (klass)
            {
                promises.push(CacheEngine.applyFrontMatter(klass, req.course.url + '/course/content/' + lang + '/' + klass.dir + '/info.md'));
                for (let content of klass.content)
                {
                    //apply likes:
                    if (content.url)
                    {
                        content.likes = totals[klass.slug + '/' + content.slug] || 0;
                        promises.push(CacheEngine.applyFrontMatter(content, req.course.url + '/course/content/' + lang + '/' + klass.dir + '/' + content.url,req.course.domain, (req.session.passport && req.session.passport.user)?req.session.passport.user.id:null, klass.slug, content.slug));
                    }
                }

                await Promise.all(promises);

                //current time / faketime
                let NOW = moment(req.query.time) || moment();

                let myhub = null;

                if (req.session.passport && req.session.passport.user)
                {
                    //my hub:
                    let me = await Registration.find({
                        user:req.session.passport.user.id,
                        course: req.course.domain
                    });
                    if (me.hub_id)
                        myhub = me.hub_id;
                }

                let livesegment = _.find(klass.content,(k)=>{
                    return _.has(k,'schedule');
                });
                let livesegmentindex = _.indexOf(klass.content,livesegment);

                let webinarsegment = _.findLast(klass.content,(k)=>{
                    return _.has(k,'schedule');
                });
                let webinarsegmentindex = _.indexOf(klass.content,webinarsegment);

                let live_segment_start = CacheEngine.getSegmentWithHub(livesegment,myhub);
                let webinar_segment_start = CacheEngine.getSegmentWithHub(webinarsegment,myhub);                

                let weekstart = live_segment_start.clone().subtract(2,'days');
                if (NOW.isBefore(weekstart))
                    klass.status = 'FUTURE';

                let nextclassindex = _.indexOf(data.classes,klass) + 1;
                if (nextclassindex < _.size(data.classes))
                {
                    let nextweeklivesegment = _.find(data.classes[nextclassindex].content,(k)=>{
                        return _.has(k,'schedule');
                    });
                    if (nextweeklivesegment)
                    {
                        let nextweekstart = CacheEngine.getSegmentWithHub(nextweeklivesegment,myhub).clone().subtract(2,'days');

                        if (NOW.isBetween(weekstart,nextweekstart))
                            klass.status = 'CURRENT';

                        if (NOW.isAfter(nextweekstart))
                            klass.status = 'RELEASED';
                    }
                    else
                    {
                         klass.status = 'RELEASED';
                    }
                }


                let classreleased = false;
                let webinareleased = false;

                if (NOW.isAfter(live_segment_start)) classreleased = true;
                if (NOW.isAfter(webinar_segment_start)) webinareleased = true;

                klass.content.forEach(function(content,i)
                {
                    content.status = 'FUTURE';

                    switch (content.content_type)
                    {
                        case 'pre':
                            content.status = 'RELEASED';
                            break;
                        
                        case 'question':
                            if (i < livesegmentindex)
                                content.status = 'RELEASED';
                            else if (i > livesegmentindex && i < webinarsegmentindex && classreleased)
                                content.status = 'RELEASED';
                            else if (i > webinarsegmentindex && webinareleased)
                                content.status = 'RELEASED';
                            break;
                            

                        case 'class':
                            if (classreleased)
                                content.status = 'RELEASED'
                            content.release_at = live_segment_start;
                            content.schedule = CacheEngine.getSchedForHub(content,myhub);
                            break;
                            

                        case 'postclass':
                            if (classreleased)
                                content.status = 'RELEASED'
                            break;
                            

                        case 'webinar':
                            if (webinareleased)
                                content.status = 'RELEASED'
                            content.release_at = webinar_segment_start;
                            content.schedule = CacheEngine.getSchedForHub(content,myhub);
                            break;
                            

                        case 'postwebinar':
                            if (webinareleased)
                                content.status = 'RELEASED'
                            break;
                            
                    }
                });



                return res.json(klass);
            }
            else
            {
                return res.notFound();
            }
        }
        catch (e)
        {
            return res.serverError(e);
        }
    },

    /**
     * 
     * @api {get} /v1/course/hubs Hubs
     * @apiDescription Get the list of hubs for this course
     * @apiName hubs
     * @apiGroup Course
     * @apiVersion  1.0.0
     * @apiPermission domainparse
     * 
     */
    hubs: async (req,res) =>{
        try
        {
            var data = await CacheEngine.getHubs(req,res);
            return res.json(data);
        }
        catch (e)
        {
            return res.serverError(e);
        }
    }
}
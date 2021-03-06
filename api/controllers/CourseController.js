let moment = require('moment');

module.exports = {

    /**
     * 
     * @api {post} /v1/course/like/:class/:content Like
     * @apiDescription Like the content
     * @apiName like
     * @apiGroup Course
     * @apiVersion  1.0.0
     * @apiPermission domainparse
     * 
     */
    like: async (req,res)=>{
        
        req.checkParams('class').notEmpty();
        req.checkParams('content').notEmpty();

        try
        {
            let result = await req.getValidationResult();
            result.throw();
        }
        catch (e)
        {
            return res.badRequest(e.mapped());
        }

        try
        {
            LikeTag.create({
                course: req.course.domain,
                class: req.param('class'),
                content: req.param('content'),
                user: req.session.passport.user.id
            },function(err){
                if (err)
                    throw err;

                return res.json({msg:'Like Registered'})
            });
        }
        catch (e)
        {
            return res.serverError(e);
        }
    },

        /**
     * 
     * @api {post} /v1/course/unlike/:class/:content Un-Like
     * @apiDescription Like the content
     * @apiName unlike
     * @apiGroup Course
     * @apiVersion  1.0.0
     * @apiPermission domainparse
     * 
     */
    unlike: async (req,res)=>{
        
        req.checkParams('class').notEmpty();
        req.checkParams('content').notEmpty();

        try
        {
            let result = await req.getValidationResult();
            result.throw();
        }
        catch (e)
        {
            return res.badRequest(e.mapped());
        }

        try
        {
            LikeTag.destroy({
                course: req.course.domain,
                class: req.param('class'),
                content: req.param('content'),
                user: req.session.passport.user.id
            },function(err){
                if (err)
                    throw err;

                return res.json({msg:'Like Un-Registered'})
            });
        }
        catch (e)
        {
            return res.serverError(e);
        }
    },

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

            sails.log.verbose('data:');
            sails.log.verbose(data);

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

            if (req.session.passport && req.session.passport.user && _.includes(req.session.passport.user.admin,req.course.domain))
                NOW = enddate.clone().add(1,'day');

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
                    else
                    {
                        currentWeek = klass;
                    }
                }
            });
            
            let currentClass = _.indexOf(data.classes, currentWeek);

            if (NOW.isBefore(enddate) && currentClass == -1)
                currentClass = 0;

            data.classes.forEach(function(klass,i){
                if (currentClass==-1 && NOW.isAfter(enddate))
                {
                    //release all classed if the course has finished
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

            let totals = await LikeTag.getLikesGrouped(req.course.domain, k);
            let totals_user = null;

            if (req.session.passport && req.session.passport.user)
            {
                totals_user = await LikeTag.getUserLiked(req.course.domain, k, req.session.passport.user.id);
            }

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
                        content.likes = totals[content.slug] || 0;
                        //have I liked it?
                        if (totals_user)
                            content.haveliked = totals_user[content.slug] || false;

                        promises.push(CacheEngine.applyFrontMatter(content, req.course.url + '/course/content/' + lang + '/' + klass.dir + '/' + content.url,req.course.domain, (req.session.passport && req.session.passport.user)?req.session.passport.user.id:null, klass.slug, content.slug));
                    }
                }

                await Promise.all(promises);

                // console.log(_.pluck(klass.content,'content_type'));

                //current time / faketime
                let NOW = moment(req.query.time) || moment();

                if (req.session.passport && req.session.passport.user && _.includes(req.session.passport.user.admin,req.course.domain))
                    NOW = moment(data.ends).add(1,'day');

                let myhub = null;
                let me = null;

                if (req.session.passport && req.session.passport.user)
                {
                    //my hub:
                    me = await Registration.findOne({
                        user:req.session.passport.user.id,
                        course: req.course.domain
                    }).populate('user');

                    if (me && me.hub_id)
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

                klass.release_at = weekstart;


                let classreleased = false;
                let webinareleased = false;

                
                if (NOW.isAfter(live_segment_start)) classreleased = true;
                if (NOW.isAfter(webinar_segment_start)) webinareleased = true;
                
                // console.log('liveclass start');
                // console.log(classreleased);

                // console.log('webinar start');
                // console.log(webinareleased);
                for (let i in klass.content) //content,i)
                {
                    let content = klass.content[i];
                    content.status = 'FUTURE';

                    // console.log(content.content_type);

                    switch (content.content_type)
                    {
                        case 'pre':
                            if (i==0 || classreleased)
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
                            

                        case 'nextclass':
                            if (webinareleased)
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

                        case 'survey':
                            //find out if completed summary:
                            content.completed = false;                            
                            if (req.session.passport && req.session.passport.user)
                            {
                                let questions = await CacheEngine.getQuestions(req,res);

                                console.log(questions);
                                
                                let myanswers = await Answer.findOne({
                                    user: req.session.passport.user.id,
                                    course: req.course.domain,
                                    question_id: _.first(questions.post).id
                                });
                    
                                console.log(myanswers);

                                if (myanswers)
                                {
                                    console.log("*******");
                                    content.completedat = myanswers.createdAt;
                                    content.completed = true;
                                }
                            }
                            break;
                            
                    }
                }

                return res.json({
                    user: (me)?_.omit(me.user,'account_credentials'):null,
                    spec:klass,
                });
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
     * @api {get} /v1/course/specpreload/:class/:blocks Class List Preload
     * @apiDescription Get the pre-load content list for this class
     * @apiName specpreload
     * @apiGroup Course
     * @apiVersion  1.0.0
     * @apiPermission domainparse
     * 
     * @apiParam  {String} class Class slug
     * @apiParam  {String} blocks Number of blocks to load (-1 is all) 
     * 
     */
    specpreload: async (req,res)=> {
        try
        {
            let k = req.param('class');

            let lang = await LangService.lang(req);

            var data = await CacheEngine.getSpec(req,res);

            let promises = [];

            //for each file in the spec, get the markdown and parse it:
            let klass = _.find(data.classes,{slug:k});
            if (klass)
            {
                promises.push(CacheEngine.applyFrontMatter(klass, req.course.url + '/course/content/' + lang + '/' + klass.dir + '/info.md'));
                let numberofblocks = _.size(klass.content);
                let blocksparam = parseInt(req.param('blocks'));
                if (blocksparam > 0)
                    numberofblocks = blocksparam;

                for (let i=0;i<numberofblocks;i++)
                {
                    let content = klass.content[i];
                    if (content.url)
                    {
                        promises.push(CacheEngine.applyFrontMatter(content, req.course.url + '/course/content/' + lang + '/' + klass.dir + '/' + content.url));
                    }
                }

                await Promise.all(promises);

                //current time / faketime
                let NOW = moment(req.query.time) || moment();
                if (req.session.passport && req.session.passport.user && _.includes(req.session.passport.user.admin,req.course.domain))
                    NOW = moment(data.ends).add(1,'day');

                let myhub = null;
                let me = null;

                if (req.session.passport && req.session.passport.user)
                {
                    //my hub:
                    me = await Registration.findOne({
                        user:req.session.passport.user.id,
                        course: req.course.domain
                    }).populate('user');
                    if (me && me.hub_id)
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

                klass.content = _.take(klass.content,numberofblocks);

                return res.json({
                    user: (me)?me.user:null,
                    spec:klass,
                });
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
            let [hubs,spec] = await Promise.all([CacheEngine.getHubs(req,res), CacheEngine.getSpec(req,res)]);
            //get all liveclasses:
            
            let NOW = moment()

            // console.log("NOW "+ NOW);

            let liveclasses = _.compact(_.flattenDeep(_.map(spec.classes,function(klass){

                //first one:
                let first = _.find(klass.content,(g)=>g.schedule);
                return (first)?first.schedule:null;
            })));

            for (let hub of hubs)
            {
                let forhub = _.filter(liveclasses,(ff)=>{
                    return ff.hub_id == hub.id;
                });

                // console.log(forhub);
                var closest = moment().add(5000,'years');
                let isset = false;

                for (let sched of forhub)
                {
                    var date = moment(sched.release_at);
                    // console.log("date " + date);
                    if (date.isAfter(NOW) && date.isBefore(closest)) {
                        // console.log('setting to '+ date);
                       closest = date;
                       isset = true;
                    }
                }

                if (isset)
                    hub.liveclass_release = closest;
            }

            return res.json(hubs);
        }
        catch (e)
        {
            return res.serverError(e);
        }
    }
}
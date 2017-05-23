let moment = require('moment');

let applyFrontMatter = async (data, uri, course, user, klass, content)=>{
    let courseinfo = await CacheEngine.getFrontmatter(uri);
    _.extend(data, courseinfo);
    delete data.published;
    if (data.video)
        delete data.url;
    if (data.expectsubmission && user)
    {
        let submissions = await Submission.find({
            course: course,
            class: klass,
            content: content,
            user: user
        });
        data.submissions = submissions;
    }
}

let getSegmentWithHub = function(segment,hub)
{
    let hubinfo = _.find(segment.schedule,{hub_id:hub});
    if (!hubinfo && _.size(segment.schedule)>1)
        hubinfo = _.find(segment.schedule,{leadhub:true});
    else
        hubinfo = _.first(segment.schedule);

    return moment(hubinfo.release_at);
}

let getLiveSegment = function(klass)
{
    let livesegment = _.find(klass.content,(k)=>{
        return _.has(k,'schedule');
    });
    
    if (livesegment)
    {
        //get earliest timestamp:
        let times = _.map(livesegment.schedule, (s)=>{
            return moment(s.release_at);
        });

        let ordered_times = times.sort();
        let start = _.first(ordered_times);
        let Wstart = moment(start);
        return Wstart;
    }
    else
    {
        return null;
    }
};

module.exports = {

    // for whole course
    schedule: async(req,res)=>{
        try
        {
            let lang = await LangService.lang(req);

            var data = await CacheEngine.getSpec(req,res);

            let promises = [];

            //course info:
            promises.push(applyFrontMatter(data, req.course.url + '/course/content/' + lang + '/info.md'));

            //for each file in the spec, get the markdown and parse it:
            for (let klass of data.classes)
            {
                promises.push(applyFrontMatter(klass, req.course.url + '/course/content/' + lang + '/' + klass.dir + '/info.md'));
                // for (let content of klass.content)
                // {
                //     //apply likes:
                //     if (content.url)
                //     {
                //         // content.likes = totals[klass.slug + '/' + content.slug];
                //         promises.push(applyFrontMatter(content, req.course.url + '/course/content/' + lang + '/' + klass.dir + '/' + content.url));
                //     }
                // }
            }

            await Promise.all(promises);

            //calculate release schedule
            let startdate = moment(data.starts);
            let enddate = moment(data.ends);
            let NOW = moment(req.param('time')) || moment();

            if (NOW.isBetween(startdate, enddate))
                data.classrunning = true;

            // has been released or is current, or will be released
            let currentWeek = null;

            data.classes.forEach(function(klass,i)
            {
                //find element which is the live class
                let ws = getLiveSegment(klass)
                if (ws)
                {
                    let Wstart = ws.subtract(2,'days');
                    if (i < _.size(data.classes)-1)
                    {
                        let ls = getLiveSegment(data.classes[i+1])
                        if (ls)
                        {
                            let Nstart = ls.subtract(2,'days');

                            if (NOW.isBetween(Wstart,Nstart))
                            {
                                //should be this one
                                currentWeek = klass;
                            }
                        }
                    }
                    else //last on in array
                    {
                        if (NOW.isAfter(Wstart))
                            currentWeek = klass;
                    }
                }
            });
            
            let currentClass = _.indexOf(data.classes, currentWeek);
            data.classes.forEach(function(klass,i){
                if (i<currentClass)
                    klass.status = 'RELEASED';
                if (i==currentClass)
                    klass.status = 'CURRENT';
                if (i>currentClass)
                {
                    klass.status = 'FUTURE';
                    klass.release_at = getLiveSegment(klass);
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

    //for one class
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
                promises.push(applyFrontMatter(klass, req.course.url + '/course/content/' + lang + '/' + klass.dir + '/info.md'));
                for (let content of klass.content)
                {
                    //apply likes:
                    if (content.url)
                    {
                        content.likes = totals[klass.slug + '/' + content.slug] || 0;
                        promises.push(applyFrontMatter(content, req.course.url + '/course/content/' + lang + '/' + klass.dir + '/' + content.url,req.course.domain, (req.session.passport && req.session.passport.user)?req.session.passport.user.id:null, klass.slug, content.slug));
                    }
                }

                await Promise.all(promises);

                //current time / faketime
                let NOW = moment(req.param('time')) || moment();

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

                let live_segment_start = getSegmentWithHub(livesegment,myhub);
                let webinar_segment_start = getSegmentWithHub(webinarsegment,myhub);                

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
                            else
                                content.release_at = live_segment_start;
                            break;
                            

                        case 'postclass':
                            if (classreleased)
                                content.status = 'RELEASED'
                            break;
                            

                        case 'webinar':
                            if (webinareleased)
                                content.status = 'RELEASED'
                            else
                                content.release_at = webinar_segment_start;
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
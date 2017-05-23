let moment = require('moment');

module.exports = function (sails) {
   
let schedule = null;
let running = false;

let run = async function(){
    try
    {
        if (!running)
        {
            running = true;
            sails.log.verbose('Running Schedule');


            let NOW = moment();
            let whitelist = await DomainControl.getWhitelist();
            // console.log(whitelist);
            //FOR EACH COURSE IN WHITELIST
            for (let c in whitelist.courses)
            {
                // console.log(course);
                sails.log.verbose('Processing notifications for ' + whitelist.courses[c].domain);
                let course = whitelist.courses[c];
                let spec = await CacheEngine.getYaml(whitelist.courses[c].url + '/course/config/spec.yaml');
                let startdate = moment(spec.starts);
                let enddate = moment(spec.ends);

                // course starting (1 week before)
                if (startdate.diff(NOW) < moment.duration(7, 'days').asMilliseconds())
                {
                    sails.log.verbose('Triggering week before ' + course.domain);
                    NotificationEngine.weekBefore(course);
                }

                // course starting (day before)
                if (startdate.diff(NOW) < moment.duration(1, 'day').asMilliseconds())
                {
                    sails.log.verbose('Triggering day before ' + course.domain);                                
                    NotificationEngine.dayBefore(course);
                }
                
                // Final questionaire push (1 day after)
                if (NOW.diff(startdate) > moment.duration(2, 'day').asMilliseconds())
                {
                    sails.log.verbose('Triggering 2 days after ' + course.domain);                                
                    NotificationEngine.courseClose(course);
                }

                //work out current week in schedule:

                // ASSUMPTIONS:
                //  - only locked timeframe is the live class
                //  - pre-content should be read ~2 days before this
                //  - submissions should be made within ~2 days of this
                
                //for each class -- NOW is between 

                //     |-----L-----W------||-----L-----W-----|

                // now is between   L -2 days and next L - 2

                let getLiveSegment = function(klass)
                {
                    let livesegment = _.find(klass.content,(k)=>{
                        return _.has(k,'schedule');
                    });
                    
                    if (livesegment)
                    {
                        //get earliest timestamp:
                        let times = _.map(livesegment.schedule, (s)=>{
                            return moment(s.release_at).unix();
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

                let currentWeek = null;

                spec.classes.forEach(function(klass,i)
                {
                    //find element which is the live class
                    let Wstart = getLiveSegment(klass).subtract(2,'days');
                    if (Wstart)
                    {
                        if (i < _.size(spec.classes)-1)
                        {
                            let Nstart = getLiveSegment(spec.classes[i+1]).add(2,'days');

                            if (NOW.isAfter(Wstart) && NOW.isBefore(Nstart))
                            {
                                //should be this one
                                currentWeek = klass;
                            }
                        }
                        else //last on in array
                        {
                            if (NOW.isAfter(Wstart))
                                currentWeek = klass;
                        }
                    }
                });

                let live_segment_start = getLiveSegment(currentWeek); 
                let class_week_start = live_segment_start.subtract(2,'days');
                let webinar_start = getLiveSegment(currentWeek);
                let currentClass = _.indexOf(spec.classes, currentWeek);
                
                // read pre-content
                if (NOW.isAfter(class_week_start) && NOW.isBefore(live_segment_start))
                {
                NotificationEngine.readPreContent(course, currentClass);
                }

                // post your submission e.g. 4c
                let registered = await Registration.find({
                    course: course.domain
                }).populate('user');

                let userids = _.pluck(registered,'user.id');

                let submissions = await Submission.find({
                    course:course.domain,
                    class: currentClass
                }).populate('user');

                //submitted one
                for (let user of submissions)
                {
                    NotificationEngine.submitFeedback(course, currentClass, user);
                }

                let notsubmitted = _.difference(userids,_.pluck(submissions,'user.id'));
                
                //not submitted one
                for (let user of notsubmitted)
                {
                    NotificationEngine.submitWork(course, currentClass, _.find(registered,(r)=>{
                        return r.user.id == user
                    }));
                }

                let current_schedule = _.find(currentWeek.content,(k)=>{
                        return _.has(k,'schedule');
                });

                for (let hub of current_schedule.schedule)
                {
                    let hub_live_start = moment(hub.release_at);
                    
                    if (NOW.isAfter(hub_live_start.subtract(6,'hours'))) // 6 hour before live
                    {
                        NotificationEngine.liveClassWarning(course, currentClass, hub.hub_id);
                    }

                    if (NOW.isAfter(hub_live_start.add(3,'hours')))
                    {
                        NotificationEngine.afterLiveClass(course, currentClass, hub.hub_id);
                    }
                }
                
                // the webinar is soon
                if (webinar_start.diff(NOW) < moment.duration(6, 'hours').asMilliseconds())
                {
                    NotificationEngine.webinarSoon(course, currentClass);
                }
                
                // get ready for next week
                if (NOW.isAfter(webinar_start.add(2,'hours')))
                {
                    NotificationEngine.nextWeek(course, currentClass);
                }

            }
            running = false;
        }
        else
        {
            sails.log.verbose("Scheduler cannot run, already running");
        }
    } catch (e)
    {
        sails.log.error(e);
    }
};

   return {
       configure:function()
       {
           //EACH HOUR
           sails.on('lifted',function(){
               let interval = Math.min(2147483647,Math.round(parseInt(process.env.SCHEDULER_RATE) + (Math.random() * 5000)));
               this.schedule = setInterval(run, interval);
               run();
           });
       }
   };
}
let moment = require('moment');

module.exports = function (sails) {
   
let schedule = null;
let running = false;

let run = async function(){
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
            }

            NotificationEngine.weekBefore(course);

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
            
            // let currentClass = ??;
            // let livesegment = ??;
            // let live_segment_start = ??;
            // let class_week_start = moment(livesegment.starts).minus(2 days);
            // let webinar_start = ??;
            
            // // read pre-content
            // if (NOW between class_week_start and live_segment_start)
            // {
            //     NotificationEngine.readPreContent(course, currentClass);
            // }

            // // post your submission e.g. 4c
            // let registered = await Registration.find({
            //     course: course
            // }).populate('user');

            // let userids = _.pluck(registered,'user.id');

            // let submissions = await Submission.find({
            //     course:course,
            //     class: currentClass
            // }).populate('user');

            // //submitted one
            // for (let user in submissions)
            // {
            //     NotificationEngine.submitFeedback(course, currentClass, user);
            // }

            // let notsubmitted = _.difference(userids,_.pluck(submissions,'user.id'));
            
            // //not submitted one
            // for (let user in submissions)
            // {
            //     NotificationEngine.submitWork(course, currentClass, _.find(users,{id:user}));
            // }

            // for (let hub of currentClass.schedule)
            // {
            //     let hub_live_start = ??;
            //     if (NOW > hub_live_start - 6 hours) // 6 hour before live
            //     {
            //         NotificationEngine.liveClassWarning(course, currentClass, hub);
            //     }

            //     if (NOW > hub_live_start + 3 hours)
            //     {
            //         NotificationEngine.afterLiveClass(course, currentClass, hub);
            //     }
            // }
            
            // // the webinar is soon
            // if (webinar_start.diff(NOW) < moment.duration(6, 'hours').asMilliseconds())
            // {
            //     NotificationEngine.webinarSoon(course, currentClass);
            // }
            
            // // get ready for next week
            // if ((webinar_start + 2 hours) < NOW)
            // {
            //     NotificationEngine.nextWeek(course, currentClass);
            // }

        }
        running = false;
    }
    else
    {
        sails.log.verbose("Scheduler cannot run, already running");
    }
};

   return {
       configure:function()
       {
           //EACH HOUR
           sails.on('lifted',function(){
                this.schedule = setTimeout(run, process.env.SCHEDULER_RATE + (Math.random() * 5000));
                run();
           });
       }
   };
}
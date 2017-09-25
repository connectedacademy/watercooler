let moment = require('moment');

module.exports = function (sails) {

    let schedule = null;
    let running = false;


    // returns the earliest release time for the live segment in a given class
    let getLiveSegment = function (klass) {
        if (klass) {
            let livesegment = _.find(klass.content, (k) => {
                return _.has(k, 'schedule');
            });

            if (livesegment) {
                //get earliest timestamp:
                let times = _.map(livesegment.schedule, (s) => {
                    let tt = moment(s.release_at);
                    return tt.unix();
                });

                let ordered_times = times.sort();
                let start = _.first(ordered_times);
                let Wstart = moment(start*1000);
                return Wstart;
            }
            else {
                return null;
            }
        }
        else {
            return null;
        }
    };

    // returns the release time for the last scheduled segment in a given class
    let getWebinarSegment = function (klass) {
        if (klass) {
            let livesegment = _.find(klass.content, (k) => {
                return _.has(k, 'schedule');
            });

            if (livesegment) {
                //get earliest timestamp:
                let times = _.map(livesegment.schedule, (s) => {
                    let tt = moment(s.release_at);
                    return tt.unix();
                });

                let ordered_times = times.sort();
                let start = _.last(ordered_times);
                let Wstart = moment(start*1000);
                return Wstart;
            }
            else {
                return null;
            }
        }
        else {
            return null;
        }
    };

    let getCurrentWeek = function(NOW,spec)
    {
        let currentWeek = null;
        // Loop through classes in this course and work out which is the current class based on the time
        spec.classes.forEach(function (klass, i) {
            //find element which is the live class
            //check for live class exists:
            let Wstart = getLiveSegment(klass);
            if (Wstart) {
                Wstart = Wstart.clone().subtract(2, 'days');
                if (i < _.size(spec.classes) - 1) {
                    let nn = getLiveSegment(spec.classes[i + 1]);
                    if (nn) {
                        let Nstart = nn.clone().add(2, 'days');

                        if (NOW.isAfter(Wstart) && NOW.isBefore(Nstart)) {
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
            else
            {
                //no live class, so can't calculate date:
                if (!currentWeek)
                    currentWeek = klass
            }
        });
        return currentWeek;
    }

    let run = async function () {
        try {
            if (!running) {
                running = true;
                sails.log.verbose('Running Notification Scheduler');

                let NOW = moment();
                let whitelist = await DomainControl.getWhitelist();

                //FOR EACH COURSE IN WHITELIST
                for (let c in whitelist.courses) {
                    // console.log(course);
                    sails.log.verbose('Processing notifications for ' + whitelist.courses[c].domain);
                    let course = whitelist.courses[c];
                    let spec = await CacheEngine.getYaml(whitelist.courses[c].url + '/course/config/spec.yaml');
                    let startdate = moment(spec.starts);
                    let enddate = moment(spec.ends);

                    /**
                     * Notification of course starting 1 week before
                     */
                    if (NOW.diff(startdate) < moment.duration(7, 'days').asMilliseconds()) {
                        sails.log.verbose('Triggering week before ' + course.domain);
                        NotificationEngine.weekBefore(course);
                    }

                    /**
                     * Notification of course starting 1 day before
                     */
                    if (NOW.diff(startdate) < moment.duration(1, 'day').asMilliseconds()) {
                        sails.log.verbose('Triggering day before ' + course.domain);
                        NotificationEngine.dayBefore(course);
                    }

                    /**
                     * Notification of course closed 2 days after
                     */
                    if (NOW.diff(enddate) > moment.duration(2, 'day').asMilliseconds()) {
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

                    //get current class based on current time
                    let currentWeek = getCurrentWeek(NOW, spec);
                    //get index of the current class
                    let currentClass = _.indexOf(spec.classes, currentWeek);
                    
                    /**
                     * Notifications for pre-content reading before the live class (hub independent)
                     */
                    //get the date of the live segment in this week
                    let live_segment_start = getLiveSegment(currentWeek);
                    if (live_segment_start) {
                        let class_week_start = live_segment_start.clone().subtract(2, 'days');

                        // Notify to read pre-content
                        if (NOW.isAfter(class_week_start) && NOW.isBefore(live_segment_start)) {
                            NotificationEngine.readPreContent(course, currentClass);
                        }
                    }


                    /**
                     * Notifications for pre-content reading before the live class (hub dependent)
                     */
                    //find first segment in the class which has timing schedules (i.e. liveclass)
                    let current_schedule = _.find(currentWeek.content, (k) => {
                        return _.has(k, 'schedule');
                    });

                    // if this week has a live class schedule
                    if (current_schedule)
                    {
                        // For each hub (which has a different live release schedule)
                        for (let hub of current_schedule.schedule) {

                            let hub_live_start = moment(hub.release_at);

                            if (NOW.isAfter(hub_live_start.clone().subtract(6, 'hours'))) // 6 hour before live
                            {
                                NotificationEngine.liveClassWarning(course, currentClass, hub.hub_id);
                            }

                            if (NOW.isAfter(hub_live_start.clone().add(3, 'hours'))) {
                                NotificationEngine.afterLiveClass(course, currentClass, hub.hub_id);
                            }
                        }
                    }

                    /**
                     * Notifications related to the timing of the webinar
                     */
                    let webinar_start = getWebinarSegment(currentWeek);
                    if (webinar_start) {
                        // the webinar is soon
                        if (webinar_start.diff(NOW) < moment.duration(6, 'hours').asMilliseconds()) {
                            NotificationEngine.webinarSoon(course, currentClass);
                        }

                        // get ready for next week
                        if (NOW.isAfter(webinar_start.clone().add(2, 'hours'))) {
                            NotificationEngine.nextWeek(course, currentClass);
                        }
                    }

                    

                    /**
                     * Notifications to submit work
                     */
                    //TODO: Adjust to cope with multiple submissions in a class:

                    // Get all registered users for this course
                    let registered = await Registration.find({
                        course: course.domain
                    }).populate('user');
                    //just user ids
                    let userids = _.pluck(registered, 'user.id');
                    //get submissions for this class and course
                    let submissions = await Submission.find({
                        course: course.domain,
                        class: currentClass
                    }).populate('user');

                    //for each user, if they have submitted
                    for (let user of submissions) {
                        NotificationEngine.submitFeedback(course, currentClass, user);
                    }
                    // list of users who have not submitted one:
                    let notsubmitted = _.difference(userids, _.pluck(submissions, 'user.id'));

                    //for each user who has not submitted, send a reminder
                    for (let user of notsubmitted) {
                        NotificationEngine.submitWork(course, currentClass, _.find(registered, (r) => {
                            return r.user.id == user
                        }));
                    }
                }
                running = false;
            }
            else {
                sails.log.verbose("Scheduler cannot run, already running");
            }
        } catch (e) {
            sails.log.error(e);
        }
    };

    return {
        configure: function () {
            //EACH HOUR
            sails.on('lifted', function () {
                let interval = Math.min(2147483647, Math.round(parseInt(process.env.SCHEDULER_RATE) + (Math.random() * 5000)));
                this.schedule = setInterval(run, interval);
                run();
            });
        }
    };
}
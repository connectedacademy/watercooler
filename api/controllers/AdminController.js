const request = require('request-promise-native');
let redis = require('redis');
let rediscache = redis.createClient({
    host: process.env.REDIS_HOST,
    port: process.env.REDIS_PORT
});


module.exports = {

    root: (req, res) => {
        return res.view();
    },

    /**
     * 
     * @api {get} /clearcache Clear Cache
     * @apiName clearcache
     * @apiGroup Admin
     * @apiVersion  1.0.0 
     * 
     */
    clearcache: (req, res) => {
        //clear redis cache:
        rediscache.flushdb(function (msg) {
            sails.log.verbose('Redis cached cleared', msg);
            return res.ok('Cached cleared');
        });
    },

    /**
     * 
     * @api {get} /v1/admin/editor Content Editor
     * @apiDescription Redirect to prose.io for editing the current course.
     * @apiName editor
     * @apiGroup Admin
     * @apiVersion  1.0.0
     * @apiPermission domainparse
     * @apiPermission admin 
     * 
     */
    editor: (req, res) => {
        // console.log(req.course);
        let splits = req.course.repo.split('/');
        // console.log(process.env.EDITOR_URI + splits[3] + '/' + splits[4]);
        return res.redirect(process.env.EDITOR_URI + '#' + splits[3] + '/' + splits[4]);
    },

    /**
     * 
     * @api {post} /v1/admin/credentials Edit Credentials
     * @apiDescription Enter social media application credentials for a specfic course
     * @apiName credentials
     * @apiGroup Admin
     * @apiVersion  1.0.0
     * @apiPermission domainparse
     * @apiPermission admin 
     * 
     */
    credentials: async (req, res) => {
        //given these credentials, allow them to edit the twitter credentials of the user linked to the course (as determined by the spec doc):
        try {
            req.checkBody('account').notEmpty();
            req.checkBody('service').notEmpty();
            req.checkBody('credentials.key').notEmpty();
            req.checkBody('credentials.secret').notEmpty();

            try {
                let result = await req.getValidationResult();
                result.throw();
            }
            catch (e) {
                return res.badRequest(e.mapped());
            }

            let spec = await CacheEngine.getSpec(req, res);
            let valid_accounts = spec.accounts;

            if (!_.includes(valid_accounts, req.body.account))
                return res.forbidden('The account provided is not the one associated with this course in the specification.');

            let git = req.course.repo.split('/');
            let url = 'https://api.github.com/repos/' + git[3] + '/' + git[4];

            let me_user = await User.findOne({
                id: req.session.passport.user.id
            }).populate('admin');

            let perms = await request({
                uri: url,
                json: true,
                qs: {
                    access_token: me_user.owner.credentials.accessToken
                },
                headers: {
                    'User-Agent': 'Connected-Academy-Watercooler'
                },
            });

            if (perms.permissions.push) {
                let cred_user = await User.findOne({
                    account: req.body.account,
                    service: req.body.service
                });
                cred_user.account_credentials = req.body.credentials;
                cred_user.save(function (err) {
                    if (err)
                        return res.serverError(err);
                    else
                        return res.ok('Updated Credentials');
                });
            }
            else {
                return res.forbidden('You do not have editing permissions for this course.')
            }
        }
        catch (e) {
            return res.serverError(e);
        }
    },

    /**
     * 
     * @api {get} /v1/profile/mycontent/:class My Submissions
     * @apiDescription List all submission content for a specific class and this user
     * @apiName content
     * @apiGroup Admin
     * @apiVersion  1.0.0
     * @apiPermission domainparse
     * @apiPermission admin 
     * @apiPermission teacher 
     * 
     * @apiParam {String} class Class slug
     * 
     */
    mycontent: async (req, res) => {
        try {
            //only my own:
            let submissions = await Submission.find({
                course: req.course.domain,
                class: req.param('class'),
                user: req.session.passport.user.id,
                cached:true
            }).populate('discussion').populate('user');

            let mapped = _.map(submissions, (sub) => {
                sub.messages = _.size(sub.discussion);
                return _.omit(sub, 'discussion');
            });

            return res.json(mapped);
        }
        catch (e) {
            return res.serverError(e);
        }
    },


    /**
     * 
     * @api {get} /v1/profile/content/:class Submissions
     * @apiDescription List all submission content for a specific class and content segment
     * @apiName content
     * @apiGroup Admin
     * @apiVersion  1.0.0
     * @apiPermission domainparse
     * @apiPermission admin 
     * @apiPermission teacher 
     * 
     * @apiParam {String} class Class slug
     * @apiParam {String} teacher Only show teacher related things
     * 
     */
    content: async (req, res) => {
        try {

            //check they are either admin, or a teacher for this content:
            let isAdmin = _.includes(req.session.passport.user.admin, req.course.domain);

            //find students and only use this list:
            let classrooms = await Classroom.find({
                course: req.course.domain,
                teacher: req.session.passport.user.id
            });

            let isTeacher = _.size(classrooms);
            let forceTeacher = req.param('teacher');

            let submissions = [];
            if (isAdmin && !forceTeacher) {
                submissions = await Submission.find({
                    course: req.course.domain,
                    class: req.param('class'),
                    cached: true
                }).populate('discussion').populate('user');
            }
            else if (isTeacher) {
                if (req.param('class')) {
                    //submissions from only this class
                    let classroom = _.find(classrooms, (v) => v.class == req.param('class'));
                    if (classroom) {
                        submissions = await Submission.find({
                            course: req.course.domain,
                            class: req.param('class'),
                            user: _.map(classroom.students, (v) => v.toString())
                        }).populate('discussion').populate('user');
                    }
                    else
                        submissions = [];
                }
                else {
                    //submissions from all students from all classes:
                    let students = _.unique(_.flatten(_.map(classrooms, function (c) {
                        return _.map(c.students, (v) => v.toString())
                    })));

                    submissions = await Submission.find({
                        course: req.course.domain,
                        user: students
                    }).populate('discussion').populate('user');
                }
            }
            else {
                //only my own:
                submissions = await Submission.find({
                    course: req.course.domain,
                    class: req.param('class'),
                    user: req.session.passport.user.id
                }).populate('discussion').populate('user');
            }

            let mapped = _.map(submissions, (sub) => {
                sub.messages = _.size(sub.discussion);
                return _.omit(sub, 'discussion');
            });

            return res.json(mapped);
        }
        catch (e) {
            return res.serverError(e);
        }
    },

    /**
     * 
     * @api {get} /v1/admin/makeadmin Make Admin
     * @apiDescription Make this user an admin
     * @apiName makeadmin
     * @apiGroup Admin
     * @apiVersion  1.0.0
     * @apiPermission domainparse
     * @apiPermission owner
     * 
     */
    makeadmin: async (req, res) => {
        try {
            req.checkBody('user').notEmpty();

            try {
                let result = await req.getValidationResult();
                result.throw();
            }
            catch (e) {
                return res.badRequest(e.mapped());
            }

            let user = await User.findOne({ id: req.body.user });
            if (user) {
                if (!user.admin)
                    user.admin = [];

                if (_.includes(user.admin, req.course.domain))
                    _.pull(user.admin, req.course.domain);
                else
                    user.admin.push(req.course.domain);

                user.save(function (err) {
                    if (err)
                        return res.status(500).json(err);

                    res.json({
                        msg: 'Success'
                    });
                });
            }
            else {
                return res.status(404).json({
                    msg: 'No user with that ID found'
                });
            }
        }
        catch (e) {
            return res.serverError(e);
        }
    },

    /**
     * 
     * @api {get} /v1/profile/mymessages/:class? Messages
     * @apiDescription List this users messages for this course.
     * @apiName admin_messages_own
     * @apiGroup Profile
     * @apiVersion  1.0.0
     * @apiPermission domainparse
     * @apiPermission admin
     * @apiPermission teacher
     * 
     * @apiParam {String} class (optional) Class slug
     * 
     */
    mymessages: async (req, res) => {
        try {
            let klass = '*';
            if (req.param('class'))
                klass = req.param('class');

            let messages = await GossipmillApi.listForUserForClass(req.course.domain, klass, req.session.passport.user, false, req.session.passport.user.id);
            return res.json(messages);
        }
        catch (e) {
            return res.serverError(e);
        }
    },


    /**
     * 
     * @api {get} /v1/profile/messages/:class?/:user? Messages
     * @apiDescription List all messages for this course, if a teacher is logged in, only show ones from their classes.
     * @apiName admin_messages
     * @apiGroup Profile
     * @apiVersion  1.0.0
     * @apiPermission domainparse
     * @apiPermission admin
     * @apiPermission teacher
     * 
     * @apiParam {String} class (optional) Class slug
     * @apiParam {String} user (optional) User ID 
     * @apiParam {String} teacher Only show teacher related things 
     * 
     */
    messages: async (req, res) => {

        try {

            let klass = '*';
            if (req.param('class'))
                klass = req.param('class');

            let user = '*';

            if (req.param('user'))
                user = req.param('user');

            let forceTeacher = req.param('teacher');

            let messages = [];

            //if they are super admin, set all params appropriatly:
            if (_.includes(req.session.passport.user.admin, req.course.domain) && !forceTeacher) {
                messages = await GossipmillApi.listForUserForClass(req.course.domain, klass, req.session.passport.user, false, user)
            }
            else {
                //if they have any teacher codes:
                let codes = await Classroom.find({
                    course: req.course.domain,
                    teacher: req.session.passport.user.id
                });

                //filter codes by class (if selected)
                let filteredcodes = _.filter(codes, function (c) {
                    if (klass == '*' || c.class == klass)
                        return true;
                });
                //get the student list for all classes:
                //teach codes exist for this criteria:
                if (_.size(filteredcodes)) {
                    let ss = _.map(filteredcodes, 'students');
                    let studentlist = _.compact(_.unique(_.flattenDeep(ss)));
                    // messages = await GossipmillApi.listForUserForClass(req.course.domain, klass, req.session.passport.user, false, req.session.passport.user.id);
                    messages = await GossipmillApi.listForUsers(req.course.domain, klass, req.session.passport.user, studentlist, false);
                }
                // else
                // {
                //     //they are a user - only show them their own messages
                //     messages = await GossipmillApi.listForUserForClass(req.course.domain, klass, req.session.passport.user, false, req.session.passport.user.id);
                // }

            }

            return res.json(messages);
        }
        catch (e) {
            return res.serverError(e);
        }
    },

    /**
     * 
     * @api {get} /v1/profile/classes Classes
     * @apiDescription List all classes for this course, if a teacher is logged in, only show ones they taught.
     * @apiName classes
     * @apiGroup Profile
     * @apiVersion  1.0.0
     * @apiPermission domainparse
     * @apiPermission admin
     * @apiPermission teacher
     * 
     */
    classes: async (req, res) => {

        //should mainly list from the spec:
        let lang = await LangService.lang(req);
        var data = await CacheEngine.getSpec(req, res);
        let forceTeacher = req.param('teacher');
        let promises = [];

        //get teacher codes (if you happen to be a teacher):
        let codes = null;
        if (_.includes(req.session.passport.user.admin, req.course.domain) && !forceTeacher) {
            //admin, so get all classrooms
            codes = await Classroom.find({
                course: req.course.domain
            }).populate('teacher');
        }
        else {
            //not admin, only get the ones I am intested in
            codes = await Classroom.find({
                course: req.course.domain,
                teacher: req.session.passport.user.id
            });
        }

        //course info:
        promises.push(CacheEngine.applyFrontMatter(data, req.course.url + '/course/content/' + lang + '/info.md'));
        //for each file in the spec, get the markdown and parse it:
        for (let klass of data.classes) {
            promises.push(CacheEngine.applyFrontMatter(klass, req.course.url + '/course/content/' + lang + '/' + klass.dir + '/info.md'));
            for (let content of klass.content) {
                //apply likes:
                if (content.url) {
                    promises.push(CacheEngine.applyFrontMatter(content, req.course.url + '/course/content/' + lang + '/' + klass.dir + '/' + content.url, req.course.domain, null, klass.slug, content.slug));
                }
            }

            applyClassroom(klass, codes);
        }

        await Promise.all(promises);

        let mapped = _.map(data.classes, (s) => {
            return {
                title: s.title,
                slug: s.slug,
                classes: s.classes,
                students: s.students,
                codes: s.codes
            };
        });

        return res.json(mapped);
    },

    /**
     * 
     * @api {get} /v1/profile/users/:class? Users
     * @apiDescription List all users registered for this course
     * @apiName users
     * @apiGroup Profile
     * @apiVersion  1.0.0
     * @apiPermission domainparse
     * @apiPermission admin
     * 
     * @apiParam {String} class Class slug
     * @apiParam {String} teacher Only show teacher related things
     * 
     */
    users: async (req, res) => {

        try {
            //list users from this class (or course)
            let users = [];

            let forceTeacher = req.param('teacher');

            //is admin
            if (_.includes(req.session.passport.user.admin, req.course.domain) && !forceTeacher) {
                req.checkParams('class').isEmpty();

                try {
                    let result = await req.getValidationResult();
                    result.throw();
                }
                catch (e) {
                    return res.badRequest(e.mapped());
                }

                //admin user list
                let registrations = await Registration.find({ course: req.course.domain });
                users = await User.find({ id: _.map(registrations, 'user') }).populate('submissions', {
                    where: {
                        course: req.course.domain,
                        cached: true,
                    }
                });

                let promises = [];

                for (let user of users) {
                    promises.push(applyMessages(req, req.course.domain, user));
                }

                await Promise.all(promises);

                users = _.map(users, (u) => {
                    u.homework = _.size(u.submissions);
                    return _.omit(u, 'submissions');
                });
            }
            else {
                //is a techer:
                req.checkParams('class').notEmpty();

                try {
                    let result = await req.getValidationResult();
                    result.throw();
                }
                catch (e) {
                    return res.badRequest(e.mapped());
                }

                let criteria = {
                    course: req.course.domain,
                    teacher: req.session.passport.user.id,
                    class: req.param('class')
                };

                //is a teacher for this class:
                let code = await Classroom.findOne(criteria);
                if (code) {
                    users = await User.find({ id: code.students }).populate('submissions', {
                        where: {
                            course: req.course.domain,
                            cached: true,
                        }
                    });
                    let promises = [];

                    for (let user of users) {
                        promises.push(applyMessagesForClass(req, req.course.domain, req.param('class'), user));
                    }

                    await Promise.all(promises);
                }
                else {
                    //is just a user -- return nothing (bad request)
                    users = [];
                }
            }

            return res.json(users);
        }
        catch (e) {
            return res.serverError(e);
        }
    }
}

let applyMessagesForClass = async function (req, course, klass, filteruser) {
    let messages = await GossipmillApi.listForUserForClass(course, klass, req.session.passport.user, false, filteruser.id);
    filteruser.messages = _.size(messages.data);
    filteruser.homework = _.size(filteruser.submissions);
    filteruser.submissions = null;
    // filteruser = _.omit(filteruser, 'submissions');
}

let applyMessages = async function (req, course, filteruser) {
    let messages = await GossipmillApi.listForUser(course, req.session.passport.user, false, filteruser.id);
    filteruser.messages = _.size(messages);
}

let applyClassroom = async function (klass, codes) {
    let codesforclass = _.filter(codes, { class: klass.slug });
    let totalstudents = _.sum(_.map(codesforclass, function (r) {
        return _.size(r.students)
    }));
    klass.classes = _.size(codesforclass);
    klass.students = totalstudents;
    klass.codes = _.map(codes, function (c) {
        return {
            teacher: c.teacher,
            code: c.code,
            students: _.size(c.students)
        }
    }
    );
}
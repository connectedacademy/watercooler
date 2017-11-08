module.exports = {

    /**
     * 
     * @api {post} /v1/discussion/available/:class/:content Submissions Needing Feedback
     * @apiDescription Gets a list of submissions that require feedback
     * @apiName available
     * @apiGroup Discussion
     * @apiVersion  1.0.0
     * @apiPermission domainparse
     * @apiPermission user
     * 
     * @apiParam  {String} class Class slug
     * @apiParam  {String} content Content slug
     * 
     */
    available: async (req, res) => {
        //TODO: match with submissions in same language (user registration)

        try {
            let query = "SELECT *, $discussion.size() as discussion FROM submission LET $discussion = (SELECT FROM discussionmessage WHERE relates_to = $parent.current) \
            WHERE verified=true AND course=:course AND class=:class AND content=:content AND user <> :user\
            AND $discussion CONTAINSALL (fromuser <> :user)\
            ORDER BY discussion ASC LIMIT 9 FETCHPLAN user:1";
            let data = await Submission.query(query, {
                params:
                {
                    course: req.course.domain,
                    class: req.param('class'),
                    content: req.param('content'),
                    user: req.session.passport.user.id
                }
            });

            return res.json({
                scope: {
                    course: req.course.domain,
                    class: req.param('class'),
                    content: req.param('content')
                },
                data: _.map(Submission.removeCircularReferences(data), (f) => _.omit(f, ['@type', '@class', '@version']))
            });
        }
        catch (e) {
            return res.serverError(e);
        }
    },

    /**
     * 
     * @api {get} /v1/discussion/user/:class/:content/:user User Submissions
     * @apiDescription List submissions for this user
     * @apiName discussionuser
     * @apiGroup Discussion
     * @apiVersion  1.0.0
     * @apiPermission domainparse
     * @apiPermission user
     * 
     * @apiParam  {String} class Class slug
     * @apiParam  {String} content Content slug
     * @apiParam  {String} user User ID
     * 
     * 
     */
    user: async (req, res) => {

        let submissions = await Submission.find({
            user: req.param('user'),
            class: req.param('class'),
            content: req.param('content'),
            course: req.course.domain,
            verified: true
        }).populate('user');
        return res.json(submissions);
    },

    /**
     * 
     * @api {post} /v1/discussion/create/:submission New Feedback Message
     * @apiDescription Create a new message in a discussion
     * @apiName discussioncreate
     * @apiGroup Discussion
     * @apiVersion  1.0.0
     * @apiPermission domainparse
     * @apiPermission user
     * 
     * @apiParam  {String} submission Submission ID
     * @apiParam  {String} text Text of the message 
     * 
     */
    create: async (req, res) => {

        req.checkBody('text').notEmpty();

        try {
            let result = await req.getValidationResult();
            result.throw();
        }
        catch (e) {
            return res.badRequest(e.mapped());
        }

        let msg = {
            message: req.param('text'),
            relates_to: req.param('submission'),
            fromuser: req.session.passport.user.id,
            readAt: []
        };

        try {
            DiscussionMessage.create(msg, async (err, message) => {
                if (err) {
                    return res.serverError(err);
                }
                else {
                    //publish to anyone listening
                    let msg = await DiscussionMessage.findOne(message.id).populate('fromuser').populate('relates_to');
                    // console.log(msg.relates_to+'');
                    let users_dat = await DiscussionMessage.find({
                        relates_to: msg.relates_to.id + ''
                    });

                    let users = _.pluck(users_dat, 'fromuser');

                    //add owner of the submission to the list of users
                    users.push(msg.relates_to.user);

                    let submission = msg.relates_to;
                    users = _.uniq(users);


                    msg.relates_to = msg.relates_to.id;
                    delete msg.readAt;

                    //to any user in this conversation:
                    for (let user of users) {
                        let isownerofsubmission = submission.user == user;
                        //is my submission, and its me that the socket message is going to
                        if (isownerofsubmission) {
                            // its the logged in user (i.e. the creator) making the message, so they can see it.
                            if (user == req.session.passport.user.id) {
                                msg.canview = true;
                            }
                            else {
                                //its not the message creator, and it is the user that made the submission - decide if they should see the message:

                                // if the owner of this submission (i.e. user) has made any messages relating to a submission by the author of the message (msg.fromuser)
                                //LIST OF USERS WHO HAVE MADE MESSAGES TO SUBMISSIONS FROM THESE AUTHORS

                                //select messages that have been made 

                                let query = "SELECT count(message) as count FROM discussionmessage \
                                WHERE fromuser = "+ user + " \
                                AND relates_to.course=:course \
                                AND relates_to.class=:class \
                                AND relates_to.content=:content";
                                let author_messages = await DiscussionMessage.query(query, {
                                    params:
                                    {
                                        course: req.course.domain,
                                        class: submission.class,
                                        content: submission.content
                                    }
                                });

                                //if there are messages for this author
                                if (author_messages[0].count > 0) {
                                    //if I have made a message to this author for a related submission
                                    msg.canview = true;
                                }
                                else {
                                    //author has no messages, particularly not from me
                                    msg.canview = false;
                                }
                            }
                        }
                        else {
                            msg.canview = true;
                        }

                        // Notify ALL users via websocket
                        sails.log.verbose('PeerMessage', { user: user.toString(), msg: msg.id });
                        let wrapped = {
                            msgtype: 'discussion',
                            msg: msg
                        };
                        User.message(user.toString(), wrapped);

                        // notify all other users that a message has been posted:
                        //send offline notification (TODO: detect if they are not online)
                        if (user != req.session.passport.user.id) {
                            //only if its not the logged in user
                            let u = await User.findOne({ id: user });
                            NotificationEngine.newPeerMessage(req, u, msg);
                        }

                    }

                    return res.json(msg);
                }
            })
        }
        catch (e) {
            return res.serverError(e);
        }
    },

    /**
     * 
     * @api {post} /v1/discussion/read Mark Read
     * @apiDescription Mark a message as read by this user
     * @apiName discussionread
     * @apiGroup Discussion
     * @apiVersion  1.0.0
     * @apiPermission domainparse
     * @apiPermission user
     * 
     * @apiParam  {String} message Message ID
     * 
     */
    read: async (req, res) => {
        try {
            let message = await DiscussionMessage.findOne(req.param('message'));
            if (message) {
                if (!message.readAt)
                    message.readAt = [];
                message.readAt.push({
                    user: req.session.passport.user.id + '',
                    date: (new Date()).toISOString()
                });
                message.save(function (err) {
                    if (err)
                        return res.serverError(err);
                    else
                        return res.ok('Updated');
                });
            }
            else {
                return res.notFound();
            }
        }
        catch (e) {
            return res.serverError(e);
        }
    },

    /**
     * 
     * @api {post} /v1/discussion/verify/:submission Verify Submission
     * @apiDescription Verify that this submission is the correct one for this homework and add to discussion pool
     * @apiName verify
     * @apiGroup Discussion
     * @apiVersion  1.0.0
     * @apiPermission domainparse
     * @apiPermission user
     * 
     * @apiParam  {String} submission Submission ID
     * 
     */
    verify: async (req, res) => {
        let submission = await Submission.findOne({ id: req.param('submission') });
        if (submission) {
            if (submission.user.toString() != req.session.passport.user.id.toString())
                return res.status(403).json({
                    msg: 'You are not the owner of that submission, and cannot verify it'
                });

            submission.verified = true;
            submission.save(function (err) {
                if (err)
                    return res.serverError(err);
                return res.json(submission);
            });
        }
        else {
            return res.notFound();
        }
    },

    /**
     * 
     * @api {post} /v1/discussion/submit/:class/:content Submit New Submission
     * @apiDescription Submit a url to some content which will be scraped and returned. Accepts with or without protocol.
     * @apiName submit
     * @apiGroup Discussion
     * @apiVersion  1.0.0
     * @apiPermission domainparse
     * @apiPermission user
     * 
     * @apiParam  {String} class Class Slug
     * @apiParam  {String} content Content Slug
     * @apiParam  {String} body.url URL to scrape
     * 
     * 
     */
    submit: async (req, res) => {

        req.checkBody('url').notEmpty().isURL();

        try {
            let result = await req.getValidationResult();
            result.throw();
        }
        catch (e) {
            return res.badRequest(e.mapped());
        }

        let url = req.body.url;
        if (!_.startsWith(url, 'http'))
            url = `https://${url}`;

        try {
            let data = await SubmissionScraper.scrapeForSubmission(req, req.param('class'), req.param('content'), url);
            return res.json({
                url: url,
                submissions: data
            });
        }
        catch (e) {
            console.log(e);
            return res.serverError({
                msg: 'Cannot parse submission from this URL'
            });
        }
    },

    /**
     * 
     * @api {get} /v1/discussion/thumbnail/:submission Submission Thumbnail
     * @apiDescription Thumbnail for submission
     * @apiName submissionthumbnail
     * @apiGroup Discussion
     * @apiVersion  1.0.0
     * 
     * @apiParam {String} submission Submission ID
     * 
     */
    thumbnail: async (req, res) => {
        return res.redirect(`https://${process.env.AWS_S3_BUCKET}.s3.amazonaws.com/submission/${req.param('submission').replace('#','%23').replace(':','%3A')}/content/thumb/medium.jpg`);
    },

    /**
     * 
     * @api {get} /v1/discussion/submission/:submission Get Submission
     * @apiDescription Return a specific submission
     * @apiName discussionsubmission
     * @apiGroup Discussion
     * @apiVersion  1.0.0
     * @apiPermission domainparse
     * @apiPermission user
     * 
     * @apiParam  {String} submission Submission ID
     * 
     */
    submission: async (req, res) => {
        let submission = await Submission.findOne(req.param('submission')).populate('user');
        if (submission)
            return res.json(submission);
        else
            return res.notFound();
    },

    /**
     * 
     * @api {post} /v1/discussion/remove Remove Submission
     * @apiDescription Removes a specific submission for any reason
     * @apiName rmsubmission
     * @apiGroup Discussion
     * @apiVersion  1.0.0
     * @apiPermission domainparse
     * @apiPermission user
     * 
     */
    remove: async (req, res) => {

        req.checkBody('id').notEmpty();

        try {
            let result = await req.getValidationResult();
            result.throw();
        }
        catch (e) {
            return res.badRequest(e.mapped());
        }

        let submission = await Submission.findOne({ id: req.body.id });
        if (submission)
            if (submission.user.toString() == req.session.passport.user.id.toString()) {
                let q = 'UPDATE submission SET verified = false WHERE @rid=:id';
                let result = await Submission.query(q, {
                    params: {
                        id: submission.id
                    }
                });

                console.log(result);

                return res.json({
                    msg: 'Submission removed!'
                });
            }
            else {
                return res.status(403).json({
                    msg: 'You are not the owner of that submission, and cannot remove it'
                });
            }
        else
            return res.notFound();
    },

    /**
     * 
     * @api {get} /v1/discussion/messages/:submission Get Messages
     * @apiDescription Return message thread for a submission
     * @apiName discussionmessages
     * @apiGroup Discussion
     * @apiVersion  1.0.0
     * @apiPermission domainparse
     * @apiPermission user
     * 
     * @apiParam  {String} submission Submission ID
     * 
     */
    messages: async (req, res) => {

        //list all messages for this submission
        let submission = await Submission.findOne(req.param('submission'));
        let data = await DiscussionMessage.find({ relates_to: req.param('submission') }).populate('fromuser');
        let msg = data;

        //if its my submission, 
        if (submission.user == req.session.passport.user.id) {

            let authors = _.uniq(_.map(msg, (m) => { return m.fromuser.id }));
            //LIST OF USERS WHO HAVE MADE MESSAGES TO SUBMISSIONS FROM THESE AUTHORS
            let query = "SELECT set(fromuser.asString()) as messagesfrom, relates_to.user as author FROM discussionmessage \
            WHERE relates_to.user IN ["+ authors.join(',') + "] \
            AND relates_to.course=:course \
            AND relates_to.class=:class \
            AND relates_to.content=:content \
            AND relates_to.verified=true \
            GROUP BY relates_to.user";

            // console.log(query);
            let author_messages = await Submission.query(query, {
                params:
                {
                    course: req.course.domain,
                    class: submission.class,
                    content: submission.content
                }
            });

            for (let m of msg) {
                // its mine
                if (m.fromuser.id == req.session.passport.user.id)
                    m.canview = true;
                else {
                    // list of messages related to submissions by this author
                    let forthisauthor = _.find(author_messages, { author: m.fromuser.id });
                    //if there are messages for this author
                    if (forthisauthor) {
                        //if I have made a message to this author for a related submission
                        m.canview = _.includes(forthisauthor.messagesfrom, req.session.passport.user.id);
                    }
                    else {
                        //author has no messages, particularly not from me
                        m.canview = false;
                    }
                }

                delete m.readAt;
            }
        }
        else {
            for (let m of msg) {
                m.canview = true;
            }
        }

        //only made read the ones that I can actually read...
        let read = {
            user: req.session.passport.user.id + '',
            date: (new Date()).toISOString()
        };

        let q = "UPDATE discussionmessage ADD readAt = " + JSON.stringify(read) + " WHERE @rid IN [" + _.pluck(_.filter(msg, { canview: true }), 'id').join(',') + '] AND readAt CONTAINSALL (user <> "' + req.session.passport.user.id + '")';
        // console.log(q);
        await DiscussionMessage.query(q);

        Submission.removeCircularReferences(msg);

        return res.json(msg);
    },

    /**
     * 
     * @api {get} /v1/discussion/list/:class/:content Get My Submissions
     * @apiDescription Returns list of discussions I am participating in for this class and content segment
     * @apiName discussionlist
     * @apiGroup Discussion
     * @apiVersion  1.0.0
     * @apiPermission domainparse
     * @apiPermission user
     * 
     * @apiParam  {String} class Class slug
     * @apiParam  {String} content Content slug
     * 
     */
    list: async (req, res) => {
        try {

            // get discussion for submissions I participate in:
            let query = "SELECT relates_to as submission, list(@this).include('readAt','@rid') as discussion FROM discussionmessage WHERE \
                (fromuser=:user or relates_to.user=:user) \
                AND relates_to.course=:course \
                AND relates_to.class=:class \
                AND relates_to.content=:content \
                AND relates_to.verified=true\
                GROUP BY relates_to FETCHPLAN submission:2 discussion:1";

            let p = Submission.query(query, {
                params: {
                    user: req.session.passport.user.id,
                    course: req.course.domain,
                    class: req.param('class'),
                    content: req.param('content')
                }
            });

            //get discussions for submissions I own:
            let o = Submission.find({
                user: req.session.passport.user.id,
                course: req.course.domain,
                class: req.param('class'),
                content: req.param('content'),
                matched: true
            })
                .populate('discussion').populate('user');

            let [participated, own] = await Promise.all([p, o]);

            own = _.map(own, function (ow) {
                return {
                    submission: ow,
                    discussion: ow.discussion
                };
            });

            let result = own.concat(participated);


            _.each(result, (dat) => {
                // console.log(dat.discussion);
                dat.unread = _.size(
                    _.filter(dat.discussion, (d) => {
                        // console.log(d.readAt);
                        return !_.find(d.readAt, { user: req.session.passport.user.id + '' });

                    })
                );
                dat.messages = _.size(dat.discussion);
            });

            result = _.map(result, (dat) => {
                let tmp = dat.submission;
                tmp.unread = dat.unread;
                tmp.message = dat.messages;
                dat.submission.user = _.pick(dat.submission.user, 'account_number', 'name', 'service', 'profile', 'link', 'account');
                return _.omit(dat.submission, ['@type', '@version', '@class']);
            });

            result = _.uniq(result, function (r) {
                return r.id
            });

            return res.json({
                scope: {
                    course: req.course.domain,
                    class: req.param('class'),
                    content: req.param('content')
                },
                data: result
            });
        }
        catch (e) {
            return res.serverError(e);
        }
    }
}
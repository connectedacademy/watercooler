module.exports = {

    /**
     * 
     * @api {socket.io} /v1/messages/subscribe/:class/:content/:startsegment/:endsegment Subscribe to Range
     * @apiDescription Subscribe to a segment range for new messages that this user should be viewing
     * @apiName message_subscribe
     * @apiGroup Messages
     * @apiVersion  1.0.0
     * @apiPermission domainparse
     * @apiPermission user
     * 
     * @apiParam  {String} class Content slug
     * @apiParam  {String} content Content slug
     * @apiParam  {Number} startsegment Starting segment number
     * @apiParam  {Number} endsegment Ending segment number
     * @apiParam  {Boolean} whitelist Use only registered users messages
     * 
     * 
     * 
     */
    subscribe: async (req, res) => {
        let whitelist = req.param('whitelist');
        let justmine = req.param('justmine');
        if (justmine && req.session.passport && req.session.passport.user)
            justmine = req.session.passport.user.id;
        let lang = await LangService.lang(req);
        let user = null;

        if (req.session.passport && req.session.passport.user)
            user = req.session.passport.user;
        else {
            let spec = await CacheEngine.getSpec(req);
            user = {
                service: 'twitter',
                account: _.first(spec.accounts)
            };
        }

        try {
            let success = await GossipmillApi.subscribe(req, req.course.domain, req.param('class'), user, lang, req.param('content'), req.param('startsegment'), req.param('endsegment'), whitelist, justmine);
            return res.json(success);
        }
        catch (e) {
            return res.serverError(e);
        }
    },

    /**
     * 
     * @api {socket.io} /v1/messages/unsubscribe Unsubscribe
     * @apiDescription Unsubscribe to all message based socket events
     * @apiName message_unsubscribe
     * @apiGroup Messages
     * @apiVersion  1.0.0
     * @apiPermission domainparse
     * @apiPermission user
     * 
     */
    unsubscribe: async (req, res) => {
        try {
            let success = await GossipmillApi.unsubscribe(req);
            return res.json(success);
        }
        catch (e) {
            return res.serverError(e);
        }
    },

    /**
     * 
     * @api {post} /v1/messages/create New Message
     * @apiDescription Create a new message
     * @apiName message_create
     * @apiGroup Messages
     * @apiVersion  1.0.0
     * @apiPermission domainparse
     * @apiPermission user
     * 
     * @apiParam  {String} text Contents of message
     * @apiParam  {String} replyto Message to reply to
     * 
     */
    create: async (req, res) => {

        if (!req.isSocket) {
            req.checkBody('text').notEmpty();
            req.checkBody('replyto').optional().notEmpty();

            try {
                let result = await req.getValidationResult();
                result.throw();
            }
            catch (e) {
                return res.badRequest(e.mapped());
            }
        }

        try {
            let spec = await CacheEngine.getSpec(req, res);
            let account = _.first(spec.accounts);
            let service = req.session.passport.user.service;
            let account_user = await User.findOne({
                service: service,
                account: account
            });

            let me_user = await User.findOne({
                id: req.session.passport.user.id
            });

            if (account_user && account_user.account_credentials && account_user.account_credentials.key && account_user.account_credentials.secret) {
                let data = await GossipmillApi.create(account_user.account_credentials, me_user, req.body);
                return res.json(data);
            }
            else {
                return res.serverError('No Application credentials supplied for ' + service + " - " + account);
            }
        }
        catch (e) {
            return res.serverError(e);
        }
    },

    /**
     * 
     * @api {get} /v1/messages/visualisation/:class/:content/:groupby/:limit Visualisation
     * @apiDescription Visualisation of message activity for each segment
     * @apiName message_visualisation
     * @apiGroup Messages
     * @apiVersion  1.0.0
     * @apiPermission domainparse
     * @apiPermission user
     * 
     * @apiParam  {String} class Content slug
     * @apiParam  {String} content Content slug
     * @apiParam  {int} groupby Number of segments to group by
     * @apiParam  {int} limit Upper block number by which to normalise results
     * @apiParam  {Boolean} whitelist Limit to messages from registered users 
     * @apiParam  {Boolean} clearcache Force non-cached version
     * 
     */
    visualisation: async (req, res) => {

        if (!req.isSocket) {
            req.checkQuery('whitelist').optional().isBoolean();
            req.checkParams('class').notEmpty();
            req.checkParams('content').notEmpty();
            req.checkParams('groupby').isInt();
            req.checkParams('limit').optional().isInt();            
            req.checkQuery('justmine').optional().isBoolean();
            req.checkQuery('clearcache').optional().isBoolean();

            try {
                let result = await req.getValidationResult();
                result.throw();
            }
            catch (e) {
                return res.badRequest(e.mapped());
            }
        }

        let lang = await LangService.lang(req);
        try {
            let justmine = req.param('justmine');
            if (justmine && req.session.passport && req.session.passport.user)
                justmine = req.session.passport.user.id;
            let data = await GossipmillApi.visualisation(req.course.domain, req.param('class'), req.param('content'), lang, req.param('whitelist'), req.param('groupby'),  req.param('limit'), justmine, req.param('clearcache'));

            return res.json({
                scope: {
                    class: req.param('class'),
                    content: req.param('content'),
                    groupby: req.param('groupby'),
                    whitelist: req.param('whitelist'),
                    limit: req.param('limit'),
                    justmine: req.param('justmine')
                },
                data: data
            });
        }
        catch (e) {
            return res.serverError(e);
        }
    },

    /**
     * 
     * @api {get} /v1/messages/list/:class/:content Likes
     * @apiDescription Return number of likes for a specific item of content
     * @apiName message_likes
     * @apiGroup Messages
     * @apiVersion  1.0.0
     * @apiPermission domainparse
     * @apiPermission user
     * 
     * @apiParam  {String} class Class slug
     * @apiParam  {String} content Content slug
     * @apiParam  {Boolean} clearcache Force non-cached version
     * 
     */
    likes: async (req, res) => {
        if (!req.isSocket) {
            req.checkParams('class').notEmpty();
            req.checkParams('content').notEmpty();
            req.checkQuery('justmine').optional().notEmpty();
            req.checkQuery('clearcache').optional().isBoolean();

            try {
                let result = await req.getValidationResult();
                result.throw();
            }
            catch (e) {
                return res.badRequest(e.mapped());
            }

        }
        // let uri = decodeURI(req.param('class'));
        let justmine = req.param('justmine');
        if (justmine && req.session.passport && req.session.passport.user)
            justmine = req.session.passport.user.id;

        try {
            let data = await GossipmillApi.totals(req.course.domain, req.param('class'), req.param('content'), justmine, req.param('clearcache'));
            if (_.isEmpty(data)) {
                data = {};
                data[req.param('class') + '/' + req.param('content')] = 0;
            }
            return res.json(data);
        }
        catch (e) {
            return res.serverError(e);
        }
    },

    /**
     * 
     * @api {get} /v1/messages/summary/:class/:content/:startsegment/:endsegment Summary
     * @apiDescription Return single message and totals for given segment range
     * @apiName message_summary
     * @apiGroup Messages
     * @apiVersion  1.0.0
     * @apiPermission domainparse
     * @apiPermission user
     * 
     * @apiParam  {String} class Content slug
     * @apiParam  {String} content Content slug
     * @apiParam  {Number} startsegment Starting segment number
     * @apiParam  {Number} endsegment Ending segment number
     * @apiParam  {Boolean} whitelist Use only registered users messages
     * 
     */
    summary: async (req, res) => {

        if (!req.isSocket) {
            req.checkParams('class').notEmpty();
            req.checkParams('content').notEmpty();
            req.checkParams('startsegment').notEmpty().isInt();
            req.checkParams('endsegment').notEmpty().isInt();
            req.checkQuery('whitelist').isBoolean();
            req.checkQuery('ismine').optional().isBoolean();

            if (parseInt(req.param('startsegment')) > parseInt(req.param('endsegment')))
                return res.badRequest({
                    msg: 'startsegment needs to be less than endsegment'
                });

            try {
                let result = await req.getValidationResult();
                result.throw();
            }
            catch (e) {
                return res.badRequest(e.mapped());
            }
        }

        try {
            let lang = await LangService.lang(req);

            let justmine = req.param('justmine');
            if (justmine && req.session.passport && req.session.passport.user)
                justmine = req.session.passport.user.id;

            let course = req.course.domain;
            let user = {};
            let spec = null;

            if (req.session.passport && req.session.passport.user)
                user = req.session.passport.user;
            else {
                spec = await CacheEngine.getSpec(req);
                user = {
                    service: 'twitter',
                    account: _.first(spec.accounts)
                };
            }

            let dat = await GossipmillApi.summary(course, req.param('class'), user, lang, req.param('content'), req.param('startsegment'), req.param('endsegment'), req.param('whitelist'), justmine,(req.session.passport)?true:false);
            let data = dat.data;


            if (_.isEmpty(data.message)) {
                if (spec == null)
                    spec = await CacheEngine.getSpec(req);

                //get class spec
                let klass = _.find(spec.classes, { slug: req.param('class') });
                if (klass) {
                    let content = _.find(klass.content, { slug: req.param('content') });
                    //get file:
                    let file = await CacheEngine.getFrontmatter(req.course.url + '/course/content/' + lang + '/' + klass.dir + '/' + content.url);
                    if (file.prompts) {
                        //load prompts file:
                        let srt = await CacheEngine.getSubs(req.course.url + '/course/content/' + lang + '/' + klass.dir + '/' + file.prompts);

                        let startseg = parseInt(req.param('startsegment'));
                        let endseg = parseInt(req.param('endsegment'));
                        let sub = _.find(srt, function (s) {
                            return Math.round(s.start) >= startseg && Math.round(s.start) <= endseg;
                        });
                        if (sub)
                            data.message = {
                                text: sub.text,
                                suggestion: true
                            }
                    }
                }
                else {
                    sails.log.error('No class found', 'messsages/summary', req.param('class'));
                }
            }

            return res.json({
                scope: {
                    class: req.param('class'),
                    content: req.param('content'),
                    startsegment: req.param('startsegment'),
                    endsegment: req.param('endsegment'),
                    whitelist: req.param('whitelist'),
                    justmine: req.param('justmine')
                },
                data: data
            });
        }
        catch (e) {
            return res.serverError(e);
        }
    },

    /**
     * 
     * @api {get} /v1/messages/summarybatch/:class/:content/:startsegment/:endsegment/:groupsize Batch Summary
     * @apiDescription Return single message for each grouped segment and totals for given segment range
     * @apiName message_summarybatch
     * @apiGroup Messages
     * @apiVersion  1.0.0
     * @apiPermission domainparse
     * @apiPermission user
     * 
     * @apiParam  {String} class Content slug
     * @apiParam  {String} content Content slug
     * @apiParam  {Number} startsegment Starting segment number
     * @apiParam  {Number} endsegment Ending segment number
     * @apiParam  {Number} groupsize Size to group segments 
     * @apiParam  {Boolean} whitelist Use only registered users messages
     * 
     */
    summarybatch: async (req, res) => {

        if (!req.isSocket) {
            req.checkParams('class').notEmpty();
            req.checkParams('content').notEmpty();
            req.checkParams('startsegment').notEmpty().isInt();
            req.checkParams('endsegment').notEmpty().isInt();
            req.checkParams('groupsize').notEmpty().isInt();
            req.checkQuery('whitelist').isBoolean();
            req.checkQuery('justmine').optional().isBoolean();

            if (parseInt(req.param('startsegment')) > parseInt(req.param('endsegment')))
                return res.badRequest({
                    msg: 'startsegment needs to be less than endsegment'
                });

            try {
                let result = await req.getValidationResult();
                result.throw();
            }
            catch (e) {
                return res.badRequest(e.mapped());
            }
        }

        try {
            let lang = await LangService.lang(req);
            let course = req.course.domain;
            let user = {};
            let spec = null;
            if (req.session.passport && req.session.passport.user)
                user = req.session.passport.user;
            else {
                spec = await CacheEngine.getSpec(req);
                user = {
                    service: 'twitter',
                    account: _.first(spec.accounts)
                };
            }

            let start = parseInt(req.param('startsegment'));
            let end = parseInt(req.param('endsegment'));
            let group = parseInt(req.param('groupsize'));
            let justmine = req.param('justmine');
            if (justmine && req.session.passport && req.session.passport.user)
                justmine = req.session.passport.user.id;

            let promises = [];
            for (let i = start; i < end; i = i + group) {
                promises.push(GossipmillApi.summary(course, req.param('class'), user, lang, req.param('content'), i, (i + group) - 1, req.param('whitelist'), justmine, (req.session.passport)?true:false));
            }

            let results = await Promise.all(promises);


            if (_.any(results, (r) => _.isEmpty(r.message))) {
                //get file:
                //get class spec
                if (spec == null)
                    spec = await CacheEngine.getSpec(req);

                let klass = _.find(spec.classes, { slug: req.param('class') });
                let content = _.find(klass.content, { slug: req.param('content') });
                let file = await CacheEngine.getFrontmatter(req.course.url + '/course/content/' + lang + '/' + klass.dir + '/' + content.url);
                //load prompts file:
                if (file.prompts) {
                    let srt = await CacheEngine.getSubs(req.course.url + '/course/content/' + lang + '/' + klass.dir + '/' + file.prompts);

                    for (let result of results) {
                        if (_.isEmpty(result.data.message)) {
                            let startseg = parseInt(_.min(result.scope.query.segment));
                            let endseg = parseInt(_.max(result.scope.query.segment));
                            let sub = _.find(srt, function (s) {
                                return Math.round(s.start) >= startseg && Math.round(s.start) <= endseg;
                            });
                            if (sub)
                                result.data.message = {
                                    text: sub.text,
                                    suggestion: true
                                }
                        }
                    }
                }
            }

            let results_all = {};
            for (let r of results)
                results_all[_.min(r.scope.query.segment)] = r.data;

            return res.json({
                scope: {
                    class: req.param('class'),
                    content: req.param('content'),
                    startsegment: req.param('startsegment'),
                    endsegment: req.param('endsegment'),
                    groupsize: req.param('groupsize'),
                    whitelist: req.param('whitelist'),
                    justmine: req.param('justmine')
                },
                data: results_all
            });
        }
        catch (e) {
            return res.serverError(e);
        }
    },

    /**
     * 
     * @api {get} /v1/messages/list/:class/:content/:startsegment/:endsegment List
     * @apiDescription List messages that this user should be viewing in this segment range
     * @apiName message_list
     * @apiGroup Messages
     * @apiVersion  1.0.0
     * @apiPermission domainparse
     * @apiPermission user
     * 
     * @apiParam  {String} class Content slug
     * @apiParam  {String} content Content slug
     * @apiParam  {Number} startsegment Starting segment number
     * @apiParam  {Number} endsegment Ending segment number
     * @apiParam  {Boolean} whitelist Use only registered users messages
     * @apiParam  {Number} depth Number of messages to return
     * 
     */
    list: async (req, res) => {

        if (!req.isSocket) {
            req.checkParams('class').notEmpty();
            req.checkParams('content').notEmpty();
            req.checkParams('startsegment').notEmpty().isInt();
            req.checkParams('endsegment').notEmpty().isInt();
            req.checkQuery('whitelist').isBoolean();
            req.checkQuery('depth').optional().isInt({gt: 0});
            req.checkQuery('justmine').optional().isBoolean();

            try {
                let result = await req.getValidationResult();
                result.throw();
            }
            catch (e) {
                return res.badRequest(e.mapped());
            }
        }

        try {
            let whitelist = req.param('whitelist');
            let justmine = req.param('justmine');
            if (justmine && req.session.passport && req.session.passport.user)
                justmine = req.session.passport.user.id;

            let depth = req.param('depth');
            let lang = await LangService.lang(req);
            let course = req.course.domain;
            //course, klass, user, language,contentid, startsegment, endsegment, depth
            let user = {};
            if (req.session.passport && req.session.passport.user)
                user = req.session.passport.user;
            else {
                let spec = await CacheEngine.getSpec(req);
                user = {
                    service: 'twitter',
                    account: _.first(spec.accounts)
                };
            }

            let data = await GossipmillApi.list(course, req.param('class'), user, lang, req.param('content'), req.param('startsegment'), req.param('endsegment'), depth, whitelist, justmine);
            return res.json({
                scope: {
                    class: req.param('class'),
                    content: req.param('content'),
                    startsegment: req.param('startsegment'),
                    endsegment: req.param('endsegment'),
                    length: data.scope.length,
                    whitelist: req.param('whitelist'),
                    justmine: req.param('justmine')
                },
                data: data.data
            });
        }
        catch (e) {
            return res.serverError(e);
        }
    },

    /**
     * 
     * @api {get} /v1/messages/content/:class/:content Content Messages
     * @apiDescription List messages for a specific piece of content, and subscribe to new ones
     * @apiName message_content
     * @apiGroup Messages
     * @apiVersion  1.0.0
     * @apiPermission domainparse
     * 
     * @apiParam  {String} class Content slug
     * @apiParam  {String} content Content slug
     * @apiParam  {Boolean} whitelist Use only registered users messages
     * @apiParam  {Number} limit Number of messages to return
     * 
     */
    content: async (req, res) => {

        if (!req.isSocket) {
            req.checkParams('class').notEmpty();
            req.checkParams('content').notEmpty();
            req.checkQuery('whitelist').isBoolean();
            req.checkQuery('limit').optional().isInt();
            req.checkQuery('justmine').optional().isBoolean();

            try {
                let result = await req.getValidationResult();
                result.throw();
            }
            catch (e) {
                return res.badRequest(e.mapped());
            }
        }

        try {
            let whitelist = req.param('whitelist');
            let justmine = req.param('justmine');
            if (justmine && req.session.passport && req.session.passport.user)
                justmine = req.session.passport.user.id;
            let depth = req.param('limit');
            let lang = await LangService.lang(req);
            let course = req.course.domain;
            //course, klass, user, language,contentid, startsegment, endsegment, depth
            let user = {};
            if (req.session.passport && req.session.passport.user)
                user = req.session.passport.user;
            else {
                let spec = await CacheEngine.getSpec(req);
                user = {
                    service: 'twitter',
                    account: _.first(spec.accounts)
                };
            }

            if (req.isSocket) {
                try {
                    await GossipmillApi.subscribecontent(req, req.course.domain, req.param('class'), req.session.passport.user, lang, req.param('content'), whitelist, justmine);
                }
                catch (e) {
                    return res.serverError(e);
                }
            }

            let data = await GossipmillApi.listcontent(course, req.param('class'), user, lang, req.param('content'), depth, whitelist, justmine);
            return res.json({
                scope: {
                    class: req.param('class'),
                    content: req.param('content'),
                    length: data.scope.length,
                    whitelist: req.param('whitelist'),
                    justmine: req.param('justmine')
                },
                data: data.data
            });
        }
        catch (e) {
            return res.serverError(e);
        }
    }
}
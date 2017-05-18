module.exports = {

    
    subscribe: async (req, res) => {
        let whitelist = req.param('whitelist');
        let lang = await LangService.lang(req);
        try {
            let success = await GossipmillApi.subscribe(req, req.course.domain, req.param('class'), req.session.passport.user, lang, req.param('content'), req.param('startsegment'), req.param('endsegment'));
            return res.json(success);
        }
        catch (e) {
            return res.serverError(e);
        }
    },

    create: async (req, res) => {

        if (!req.isSocket)
        {
            req.checkBody('text').notEmpty();
            req.checkBody('replyto').optional().notEmpty();
            req.checkBody('remessageof').optional().notEmpty();

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
                return res.serverError('No Application credentials supplied for ' + service + ", " + account);
            }
        }
        catch (e) {
            return res.serverError(e);
        }
    },

    visualisation: async (req, res) => {

        if (!req.isSocket)
        {
            req.checkQuery('whitelist').optional().isBoolean();
            req.checkParams('class').notEmpty();
            req.checkParams('content').notEmpty();

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
            let data = await GossipmillApi.visualisation(req.course.domain, req.param('class'), req.param('content'), lang, req.param('whitelist'));

            return res.json({
                scope: {
                    class: req.param('class'),
                    content: req.param('content')
                },
                data: data
            });
        }
        catch (e) {
            return res.serverError(e);
        }
    },

    likes: async (req, res) => {
        if (!req.isSocket)
        {
            req.checkParams('class').notEmpty();
            req.checkParams('content').notEmpty();


            try {
                let result = await req.getValidationResult();
                result.throw();
            }
            catch (e) {
                return res.badRequest(e.mapped());
            }

        }
        // let uri = decodeURI(req.param('class'));
        try {
            let data = await GossipmillApi.totals(req.course.domain, req.param('class'), req.param('content'));
            if (_.isEmpty(data))
            {
                data = {};
                data[req.param('class') +'/'+ req.param('content')] = 0;
            }
            return res.json(data);
        }
        catch (e) {
            return res.serverError(e);
        }
    },

    summary: async (req, res) => {

        if (!req.isSocket)
        {
            req.checkParams('class').notEmpty();
            req.checkParams('content').notEmpty();
            req.checkParams('startsegment').notEmpty().isInt();
            req.checkParams('endsegment').notEmpty().isInt();
            req.checkQuery('whitelist').isBoolean();

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

            if (req.session.passport)
                user = req.session.passport.user;
            else {
                spec = await CacheEngine.getSpec(req);
                user = {
                    service: 'twitter',
                    account: _.first(spec.accounts)
                };
            }

            let dat = await GossipmillApi.summary(course, req.param('class'), user, lang, req.param('content'), req.param('startsegment'), req.param('endsegment'), req.param('whitelist'));
            let data = dat.data;


            if (_.isEmpty(data.message))
            {
                if (spec==null)
                    spec = await CacheEngine.getSpec(req);

                //get class spec
                let klass = _.find(spec.classes,{slug:req.param('class')});
                let content = _.find(klass.content,{slug:req.param('content')});
                //get file:
                let file = await CacheEngine.getFrontmatter(req.course.url + '/course/content/' + lang + '/' + klass.dir + '/' + content.url);
                if (file.prompts)
                {
                    //load prompts file:
                    let srt = await CacheEngine.getSubs(req.course.url + '/course/content/' + lang + '/' + klass.dir + '/' + file.prompts);

                    let startseg = parseInt(req.param('startsegment'));
                    let endseg = parseInt(req.param('endsegment'));
                    let sub = _.find(srt,function(s){
                        return Math.round(s.start) >= startseg && Math.round(s.end) <= endseg;
                    });
                    if (sub)
                        data.message = {
                            text: sub.text,
                            suggestion: true
                        }
                }
                // console.log(sub);
            }

            return res.json({
                scope: {
                    class: req.param('class'),
                    content: req.param('content'),
                    startsegment: req.param('startsegment'),
                    endsegment: req.param('endsegment')
                },
                data: data
            });
        }
        catch (e) {
            return res.serverError(e);
        }
    },

    summarybatch: async (req, res) => {

        if (!req.isSocket)
        {
            req.checkParams('class').notEmpty();
            req.checkParams('content').notEmpty();
            req.checkParams('startsegment').notEmpty().isInt();
            req.checkParams('endsegment').notEmpty().isInt();
            req.checkParams('groupsize').notEmpty().isInt();            
            req.checkQuery('whitelist').isBoolean();

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
            if (req.session.passport)
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

            let promises = [];
            for (let i=start;i<end;i=i+group)
            {
                promises.push(GossipmillApi.summary(course, req.param('class'), user, lang, req.param('content'), i, (i+group)-1, req.param('whitelist')));
            }

            let results = await Promise.all(promises);


            if (_.any(results,(r)=>_.isEmpty(r.message)))
            {
                //get file:
                //get class spec
                if (spec==null)
                    spec = await CacheEngine.getSpec(req);

                let klass = _.find(spec.classes,{slug:req.param('class')});
                let content = _.find(klass.content,{slug:req.param('content')});
                let file = await CacheEngine.getFrontmatter(req.course.url + '/course/content/' + lang + '/' + klass.dir + '/' + content.url);
                //load prompts file:
                if (file.prompts)
                {
                    let srt = await CacheEngine.getSubs(req.course.url + '/course/content/' + lang + '/' + klass.dir + '/' + file.prompts);

                    for (let result of results)
                    {
                        if (_.isEmpty(result.message))
                        {
                            let startseg = parseInt(_.min(result.scope.query.segment));
                            let endseg = parseInt(_.max(result.scope.query.segment));
                            let sub = _.find(srt,function(s){
                                return Math.round(s.start) >= startseg && Math.round(s.end) <= endseg;
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
                    groupsize: req.param('groupsize')
                },
                data: results_all
            });
        }
        catch (e) {
            return res.serverError(e);
        }
    },

    list: async (req, res) => {

        if (!req.isSocket)
        {
            req.checkParams('class').notEmpty();
            req.checkParams('content').notEmpty();
            req.checkParams('startsegment').notEmpty().isInt();
            req.checkParams('endsegment').notEmpty().isInt();
            req.checkQuery('whitelist').isBoolean();
            req.checkQuery('depth').optional().isInt();   

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
            let depth = req.param('depth');
            let lang = await LangService.lang(req);
            let course = req.course.domain;
            //course, klass, user, language,contentid, startsegment, endsegment, depth
            let user = {};
            if (req.session.passport)
                user = req.session.passport.user;
            else {
                let spec = await CacheEngine.getSpec(req);
                user = {
                    service: 'twitter',
                    account: _.first(spec.accounts)
                };
            }

            let data = await GossipmillApi.list(course, req.param('class'), user, lang, req.param('content'), req.param('startsegment'), req.param('endsegment'), depth, whitelist);
            return res.json({
                scope: {
                    class: req.param('class'),
                    content: req.param('content'),
                    startsegment: req.param('startsegment'),
                    endsegment: req.param('endsegment')
                },
                data: data.data
            });
        }
        catch (e) {
            return res.serverError(e);
        }
    }
}
module.exports = {

    subscribe: async (req,res)=>{
        let whitelist = req.param('whitelist');
        let lang = await LangService.lang(req);
        try
        {
            let success = await GossipmillApi.subscribe(req, req.course.domain, req.param('class'), req.session.passport.user, lang, req.param('content'), req.param('start-segment'), req.param('end-segment'));
            return res.json(success);
        }
        catch (e)
        {
            return res.serverError(e);   
        }
    },

    create: async (req,res) => {

        req.checkBody('text').notEmpty();
        req.checkBody('replyto').optional().notEmpty();
        req.checkBody('remessageof').optional().notEmpty();
        
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
            let lang = await LangService.lang(req);
            let spec = await CacheEngine.getSpec(req,res);
            let account = _.first(spec.accounts);
            let service = req.session.passport.user.service;
            let account_user = await User.findOne({
                service: service,
                account: account
            });

            let me_user = await User.findOne({
                id: req.session.passport.user.id
            });

            if (account_user.account_credentials.key && account_user.account_credentials.secret)
            {
                let data = await GossipmillApi.create(account_user.account_credentials, me_user, req.body);
                return res.json(data);
            }
            else
            {
                return res.serverError('No Application credentials supplied for ' + service + ", "+ account);
            }
        }
        catch (e)
        {
            return res.serverError(e);   
        }
    },

    visualisation: async (req,res) => {

        req.checkQuery('whitelist').optional().isBoolean();
        req.checkParams('class').notEmpty();        

        try
        {
            let result = await req.getValidationResult();
            result.throw();
        }
        catch (e)
        {
            return res.badRequest(e.mapped());
        }

        let whitelist = req.param('whitelist');
        let lang = await LangService.lang(req);
        try
        {
            let data = await GossipmillApi.visualisation(req.course.domain, req.param('class'), req.session.passport.user, lang);
            return res.json({
                scope:{
                    class: req.param('class')
                },
                data: data
            });
        }
        catch (e)
        {
            return res.serverError(e);
        }
    },

    likes: async (req,res) =>{
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

        
        // let uri = decodeURI(req.param('class'));
        try
        {
            let data = await GossipmillApi.totals(req.course.domain, req.param('class') ,req.param('content'));
            return res.json(data);
        }
        catch (e)
        {
            return res.serverError(e);   
        }
    },

    list: async (req,res)=>{
        try
        {
            let whitelist = req.param('whitelist');
            let depth = req.param('depth');        
            let lang = await LangService.lang(req);
            let course = req.course.domain;
            //course, klass, user, language,contentid, startsegment, endsegment, depth
            let data = await GossipmillApi.list(course, req.param('class'), req.session.passport.user, lang, req.param('content'), req.param('startsegment'), req.param('endsegment'),depth);
            return res.json(data);
        }
        catch (e)
        {
            return res.serverError(e);
        }
    }
}
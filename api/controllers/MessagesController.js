module.exports = {

    subscribe: async (req,res)=>{
        let whitelist = req.param('whitelist');
        let lang = await LangService.lang(req);
        try
        {
            let success = await GossipmillApi.subscribe(req, req.course.domain, req.param('class'), req.session.passport.user, lang, req.param('content'), req.param('start-segment'), req.param('end-segment'));
            return res.ok('Subscribed');
        }
        catch (e)
        {
            return res.serverError(e);   
        }
    },

    create: async (req,res) => {
        // create: async (credentials, user, message)=>{
        try
        {
            let lang = await LangService.lang(req);
            let account = await _.first(CacheEngine.getSpec(req,res).account);
            let credentials = await User.findOne({
                account: account
            });
            let data = await GossipmillApi.create(credentials, req.session.passport.user, req.param('message'));
            return res.json(data);
        }
        catch (e)
        {
            return res.serverError(e);   
        }
    },

    visualisation: async (req,res) => {
        let whitelist = req.param('whitelist');
        let lang = await LangService.lang(req);
        try
        {
            let data = await GossipmillApi.visualisation(req.course.domain, req.param('class'), req.session.passport.user, lang);
            return res.json(data);
        }
        catch (e)
        {
            return res.serverError(e);   
        }
    },

    likes: async (req,res) =>{
        let uri = req.params('uri');
        try
        {
            let data = await GossipmillApi.totals(uri);
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
            let limit = req.param('limit');        
            let lang = await LangService.lang(req);
            let course = req.course.domain;
            //course, klass, user, language,contentid, startsegment, endsegment, limit
            let data = await GossipmillApi.list(course, req.param('class'), req.session.passport.user, lang, req.param('content'), req.param('startsegment'), req.param('endsegment'),limit);
            return res.json(data);
        }
        catch (e)
        {
            return res.serverError(e);
        }
    }
}
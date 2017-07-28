const request = require('request-promise-native');
let redis = require('redis');
let rediscache = redis.createClient({
    host: process.env.REDIS_HOST,
    port: process.env.REDIS_PORT
});


module.exports = {

    root: (req,res) => {
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
    clearcache: (req,res)=>
    {
        //clear redis cache:
        rediscache.flushdb(function(msg){
            sails.log.verbose('Redis cached cleared',msg);
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
    editor: (req,res)=>{
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
    credentials: async (req,res)=>{
        //given these credentials, allow them to edit the twitter credentials of the user linked to the course (as determined by the spec doc):
        try
        {
            req.checkBody('account').notEmpty();
            req.checkBody('service').notEmpty();            
            req.checkBody('credentials.key').notEmpty();
            req.checkBody('credentials.secret').notEmpty();

            try
            {
                let result = await req.getValidationResult();
                result.throw();
            }
            catch (e)
            {
                return res.badRequest(e.mapped());
            }

            let spec = await CacheEngine.getSpec(req,res);
            let valid_accounts = spec.accounts;
          
            if (!_.includes(valid_accounts,req.body.account))
                return res.forbidden('You do not have permission to change that set of credentials');
            
            let git = req.course.repo.split('/');
            let url = 'https://api.github.com/repos/' + git[3] + '/' + git[4];

            let me_user = await User.findOne({id:req.session.passport.user.id});

            let perms = await request({
                uri: url,
                json: true,
                qs:{
                    access_token: me_user.credentials.accessToken
                },
                headers: {
                    'User-Agent': 'Connected-Academy-Watercooler'
                },
            });

            if (perms.permissions.push)
            {
                let cred_user = await User.findOne({
                    account: req.body.account,
                    service: req.body.service
                });
                cred_user.account_credentials = req.body.credentials;
                cred_user.save(function(err){
                    if (err)
                        return res.serverError(err);
                    else
                        return res.ok('Updated Credentials');
                });
            }
            else
            {
                return res.forbidden('You do not have editing permissions for this course.')
            }
        }
        catch (e)
        {
            return res.serverError(e);
        }
    },

    /**
     * 
     * @api {get} /v1/admin/content/:class/:content Submissions
     * @apiDescription List all submission content for a specific class and content segment
     * @apiName content
     * @apiGroup Admin
     * @apiVersion  1.0.0
     * @apiPermission domainparse
     * @apiPermission admin 
     * @apiPermission teacher 
     * 
     * @apiParam  {String} class Class slug
     * @apiParam  {String} content Content slug
     * 
     */
    content: async (req,res)=>{
        try
        {
            req.checkBody('class').optional().notEmpty();
            req.checkBody('content').optional().notEmpty();

            try
            {
                let result = await req.getValidationResult();
                result.throw();
            }
            catch (e)
            {
                return res.badRequest(e.mapped());
            }

            //check they are either admin, or a teacher for this content:
            let isAdmin = await AuthCheck.isAdmin(req);
            let isTeacher = await AuthCheck.isTeacher(req, req.course.domain, req.param('class'),req.param('content'));

            if (!isAdmin && !isTeacher)
                return res.forbidden();

            let submissions = await Submission.find({
                course: req.course.domain,
                class:req.param('class'),
                content: req.param('content'),
                cached: true
            }).populate('discussion');

            let mapped = _.map(submissions,(sub)=>{
                sub.messages = _.size(sub.discussion);
                return _.omit(sub,'discussion');
            });

            return res.json(mapped);
        }
        catch (e)
        {
            return res.serverError(e);
        }
    },

    /**
     * 
     * @api {get} /v1/admin/classes Classes
     * @apiDescription List all classes for this course, if a teacher is logged in, only show ones they taught.
     * @apiName classes
     * @apiGroup Admin
     * @apiVersion  1.0.0
     * @apiPermission domainparse
     * @apiPermission admin
     * @apiPermission teacher 
     * 
     * @apiParam  {String} class Class slug
     * @apiParam  {String} content Content slug
     * 
     */
    classes: async (req,res)=>{
        //TODO:

        //should mainly list from the spec:
        let lang = await LangService.lang(req);
        var data = await CacheEngine.getSpec(req,res);
        let promises = [];
        //course info:
        promises.push(CacheEngine.applyFrontMatter(data, req.course.url + '/course/content/' + lang + '/info.md'));
        //for each file in the spec, get the markdown and parse it:
        for (let klass of data.classes)
        {
            promises.push(CacheEngine.applyFrontMatter(klass, req.course.url + '/course/content/' + lang + '/' + klass.dir + '/info.md'));
            for (let content of klass.content)
            {
                //apply likes:
                if (content.url)
                {
                    promises.push(CacheEngine.applyFrontMatter(content, req.course.url + '/course/content/' + lang + '/' + klass.dir + '/' + content.url, req.course.domain, null, klass.slug, content.slug));
                }
            }
        }
        await Promise.all(promises);

        if (req.session.passport.user.admin)
        // if (false)
        {
            // console.log('as admin');
            //if they are an admin, list all classes (and the primary release date for each one)
            let mapped = _.map(data.classes,(s)=>{
                return {
                    title: s.title,
                    slug: s.slug,
                    content: _.map(
                        _.filter(s.content, (f)=>{
                            return f.content_type == 'class';
                        }),
                        (c)=>{
                            return {
                                slug: c.slug,
                                title: c.title,
                                schedule: _.find(c.schedule, {leadhub:true})
                            }
                    })
                };
            });

            //TODO: for each of those -- need to find which classrooms actually ran?

            return res.json(mapped);
        }
        else
        {
            // console.log('as teacher');     
            //if they are a teacher, then list only their classes (i.e. ones they have codes for, and the dates of the hub releases relevent to their hub)
            let codes = await Classroom.find({
                teacher: req.session.passport.user.id,
                course: req.course.domain
            });

            let mapped = _.map(codes,(code)=>{
                let klass = _.find(data.classes,{slug:code.class});
                let content = _.find(klass.content,{slug:code.content});
                return {
                    title: klass.title,
                    slug: klass.slug,
                    content:[
                        {
                            slug: content.slug,
                            title: content.title,
                            schedule: _.find(content.schedule, {hub_id:req.session.passport.user.registration.hub_id})
                        }
                    ]
                }
            });

            return res.json(mapped);
        }
    },

    /**
     * 
     * @api {get} /v1/admin/users/:class?/:content? Users
     * @apiDescription List all users registered for this course
     * @apiName users
     * @apiGroup Admin
     * @apiVersion  1.0.0
     * @apiPermission domainparse
     * @apiPermission admin
     * 
     * @apiParam {String} class Class slug
     * @apiParam {String} content Content slug 
     * 
     */
    users: async (req,res)=>{

        //TODO: for each user --> get nice engagement stats about them (i.e)
        
        try
        {
            //list users from this class (or course)
            let users = [];

            if (req.session.passport.user.admin)
            // if (false)
            {
                req.checkParams('class').isEmpty();
                req.checkParams('content').isEmpty();

                try
                {
                    let result = await req.getValidationResult();
                    result.throw();
                }
                catch (e)
                {
                    return res.badRequest(e.mapped());
                }

                let isAdmin = await AuthCheck.isAdmin(req);

                if (!isAdmin)
                    return res.forbidden();

                //admin user list

                let registrations = await Registration.find({ course: req.course.domain });
                users = await User.find({id:_.map(registrations,'user')}).populate('submissions',{
                    where:{
                        course: req.course.domain,
                        cached: true,
                    }
                });

                let promises = [];
            
                for (let user of users)
                {
                    promises.push(applyMessages(req,req.course.domain, user));
                }

                await Promise.all(promises);
                
                users = _.map(users,(u)=>{
                    u.homework = _.size(u.submissions);
                    return _.omit(u, 'submissions');
                });
            }
            else
            {
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

                let isTeacher = await AuthCheck.isTeacher(req, req.course.domain, req.param('class'),req.param('content'));
                if (!isTeacher)
                    return res.forbidden();
                

                let criteria = {
                    course: req.course.domain,
                    teacher: req.session.passport.user.id,
                    class: req.param('class'),
                    content: req.param('content')
                };
                
                //teacher:
                let code = await Classroom.findOne(criteria);
                users = await User.find({id:code.students});
                let promises = [];
            
                for (let user of users)
                {
                    promises.push(applyMessagesForClass(req,req.course.domain,req.param('class'),  req.param('content'), user));
                }

                await Promise.all(promises);
            }

            return res.json(users);
        }
        catch (e)
        {
            return res.serverError(e);
        }
    }
}

let applyMessagesForClass = async function(req, course, klass, contentid, filteruser)
{
    let messages = await GossipmillApi.listForUserForClass(course, klass, req.session.passport.user.id, contentid, false, filteruser.id);
    filteruser.messages = _.size(messages);
}

let applyMessages = async function(req, course, filteruser)
{
    let messages = await GossipmillApi.listForUser(course, req.session.passport.user.id, false, filteruser.id);
    filteruser.messages = _.size(messages);
}
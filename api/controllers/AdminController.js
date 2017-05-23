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
     * 
     * @apiParam  {String} class Class slug
     * @apiParam  {String} content Content slug
     * 
     */
    content: async (req,res)=>{
        let submissions = await Submission.find({
            course: req.course.domain,
            class:req.param('class'),
            content: req.param('content'),
            cached: true
        });
        return res.json(submissions);
    },

    /**
     * 
     * @api {get} /v1/admin/users Users
     * @apiDescription List all users registered for this course
     * @apiName users
     * @apiGroup Admin
     * @apiVersion  1.0.0
     * @apiPermission domainparse
     * @apiPermission admin
     * 
     */
    users: async (req,res)=>{
         let users = await Registration.find({
            course: req.course.domain
        }).populate('user');
        return res.json(users);
    }
}
const request = require('request-promise');

module.exports = {
    editor: (req,res)=>{
        // console.log(req.course);
        let splits = req.course.repo.split('/');
        // console.log(process.env.EDITOR_URI + splits[3] + '/' + splits[4]);
        return res.redirect(process.env.EDITOR_URI + '#' + splits[3] + '/' + splits[4]);
    },

    credentials: async (req,res)=>{
        //given these credentials, allow them to edit the twitter credentials of the user linked to the course (as determined by the spec doc):
        try
        {            
            let spec = await CacheEngine.getSpec(req,res);
            let valid_accounts = spec.accounts;
          
            if (!_.includes(valid_accounts,req.body.account))
                return res.forbidden('You do not have permission to change that set of credentials');
            
            let git = req.course.repo.split('/');
            let url = 'https://api.github.com/repos/' + git[3] + '/' + git[4];

            let perms = await request({
                uri: url,
                json: true,
                qs:{
                    access_token: req.session.passport.user.credentials.accessToken
                },
                headers: {
                    'User-Agent': 'Connected-Academy-Watercooler'
                },
            });

            if (perms.permissions.push)
            {
                await User.update({account: req.body.account},{
                    credentials: req.body.credentials
                });
                return res.ok('Updated Credentials');
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

    content: (req,res)=>{
        return res.serverError();
    },

    users: (req,res)=>{
        return res.serverError();        
    }
}
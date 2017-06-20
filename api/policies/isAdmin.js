const request = require('request-promise-native');

module.exports = async function(req,res,next)
{
    if (req.session.passport && req.session.passport.user.admin)
    {
        let admin = await User.findOne(req.session.passport.user.admin);

        sails.log.info("Authenticated as Admin");
        //check that this admin can authenticate for this course
        if (!req.session.passport.allowedrepos)
        {
            sails.log.verbose('Checking push access with GitHub',admin.id,req.course);
            let git = req.course.repo.split('/');
            let url = 'https://api.github.com/repos/' + git[3] + '/' + git[4];
            let me_user = await User.findOne({id:admin.id});
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

            req.session.passport.allowedrepos = [];
            if (perms.permissions.push)
            {
                sails.log.verbose('Push access granted',admin.id,req.course);                
                req.session.passport.allowedrepos.push(req.course.repo);
            }
        }

        if (_.includes(req.session.passport.allowedrepos,req.course.repo))
            return next();
        else
            return res.forbidden();
    }
    else
    {
        return res.forbidden();
    }
}
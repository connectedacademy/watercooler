const request = require('request-promise-native');

module.exports = {

    isTeacher: async function(req, course, klass, content)
    {
        let codes = await Classroom.find({
            teacher: req.session.passport.user.id,
            course: req.course.domain,
            class: klass,
            content: content
        });
        if (_.size(codes) > 0)
            return true;
        else
            return false;
    },

    isAdmin: async function(req){
        if (req.session.passport && req.session.passport.user.admin)
        {
            let admin = await User.findOne(req.session.passport.user.admin);

            sails.log.info("Authenticated as Admin");
            //check that this admin can authenticate for this course
            if (!req.session.passport.allowedrepos || !_.includes(req.session.passport.allowedrepos, req.course.repo))
            {
                sails.log.verbose('Checking push access with GitHub',admin.id,req.course);
                let git = req.course.repo.split('/');
                let url = 'https://api.github.com/repos/' + git[3] + '/' + git[4];
                let me_user = await User.findOne({
                    id:admin.id
                });
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
                return true; //    next();
            else
                return false; //res.forbidden();
        }
        else
        {
            return false; //res.forbidden();
        }
    }
}
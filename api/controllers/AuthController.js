let pjson = require('../../package.json');
let os = require('os');
let URL = require('url').URL;

module.exports = {


    testadminlogin: (req,res)=>
    {
        req.session.redirecturi = req.get('origin') || req.get('referer');
        if (process.env.CI)
        {
            let testuser = require('../../spec/examples/adminuser.json');

            User.create(testuser).exec((err,user)=>{

                req.login(user, (err)=>
                {
                    // console.log(err);
                    return res.redirect('/auth/admindashboard');
                });

            });
        }
        else
        {
            return res.forbidden('NOT IN DEBUG MODE');
        }
    },

    testuserlogin: (req,res)=>{
        req.session.redirecturi = req.get('origin') || req.get('referer');
        if (process.env.CI)
        {
            let testuser = require('../../spec/examples/normaluser.json');

            User.create(testuser).exec((err,user)=>{
                // console.log()
                req.login(user, (err)=>
                {
                    // console.log(err);

                    return res.redirect('/auth/dashboard');
                });
            });
        }
        else
        {
             return res.forbidden('NOT IN DEBUG MODE');
        }
    },

	root: (req,res) =>
    {
        return res.json({
            msg:'Watercooler Running',
            version: pjson.version,
            host: os.hostname(),
            uptime: process.uptime()
        })
    },

    logout: (req, res) => {
        req.logout();
        return res.ok('Logged out successfully.');
    },

    twitter_callback: (req,res,next)=>{
        sails.passport.authenticate('twitter',{successRedirect: '/auth/dashboard', failureRedirect: '/auth/fail' })(req,res,next);
    },

    login: (req,res,next) =>{
        //verify referer / origin, if valid, then allow and save into session
        // console.log(req.get('origin') || req.get('referer'));
        let url = new URL(req.get('origin') || req.get('referer'))
        // console.log(url.origin);
        req.session.redirecturi = url.origin;
        sails.passport.authenticate('twitter')(req,res,next);
    },

    admin: (req,res,next)=>{
        //verify referer / origin, if valid, then allow and save into session
        let url = new URL(req.get('origin') || req.get('referer'))
        req.session.redirecturi = url.origin;
        // req.session.redirecturi = req.get('origin') || req.get('referer');
        sails.passport.authenticate('github')(req,res,next);
    },

    admin_logout: (req,res,next)=>{
        req.logout();
        return res.ok('Logged out successfully.');
    },

    github_callback: (req,res,next)=>{
        sails.passport.authenticate('github',{successRedirect: '/auth/admindashboard', failureRedirect: '/auth/fail' })(req,res,next);
    },

    dashboard: (req,res)=>{
        return res.redirect(req.session.redirecturi + '/registration');
    },

    admindashboard: (req,res)=>{
        return res.redirect(req.session.redirecturi + '/admin');
    },

    fail: async (req,res)=>{
       return res.redirect(req.session.redirecturi + '/loginfail');
    },

    me: async (req,res)=>{
        if (req.session.passport)
        {
            try
            {
                var user = await User.findOne(req.session.passport.user.id).populate('registrations',{
                    course: req.course.domain
                });

                user.registration = _.first(user.registrations);
                user = _.omit(user,'registrations');

                return res.json({
                    user: (user.service=='twitter')? user : null,
                    admin: (user.service=='github')? user : null
                });
            }
            catch (e)
            {
                return res.serverError(e);
            }
        }
        else
        {
            return res.forbidden();
        }
    },

    profile: async (req,res)=>{

        //TODO: change this to use registrations collection
        try
        {
            var registration = await Registration.findOne({
                user:req.session.passport.user.id,
                course: req.course.domain
            }).populate('user');

            registration.hub_id = req.body.hub_id;
            //get registration for this course and change lang
            registration.lang = req.body.lang;

            user.email = req.body.email;

            registration.save(function(err){
                if (err)
                    return res.serverError(err);
                else
                    return res.ok('Profile updated');
            });
        }
        catch(e)
        {
            return res.serverError(e);
        }
    },

    registrationquestions: async (req,res)=>{
        let questions = await CacheEngine.getQuestions(req,res);
        //randomly pick a question:
        let data = {
            release: questions.release,
            questions: questions.registration
        };
        return res.json(data);
    },

    register: async (req,res) =>{
        try
        {

            req.checkBody('email').isEmail();
            req.checkBody('lang').notEmpty();
            req.checkBody('hub_id').notEmpty();
            req.checkBody('region').notEmpty();
            req.checkBody('age').notEmpty();
            req.checkBody('registration_info').notEmpty();
            req.checkBody('data_consent').isBoolean();
            req.checkBody('research_consent').isBoolean();

            try
            {
                let result = await req.getValidationResult();
                result.throw();
            }
            catch (e)
            {
                return res.badRequest(e.mapped());
            }

            if (!req.body.data_consent || !req.body.research_consent)
                return res.badRequest('Consent not given');

            let user = await User.findOne(req.session.passport.user.id).populate('registrations');

            //check there is not an existing registration for this course
            if (!_.find(user.registrations,{course:req.course.domain}))
            {
                req.body.course = req.course.domain;
                let email = req.body.email;
                delete req.body.email;
                user.registrations.add(req.body);
                user.email = email;
                user.save(function(err){
                    if (err)
                        return res.serverError(err);
                    else
                        return res.ok('Registration Complete');
                });
            }
            else
            {
                return res.badRequest('Already registered for this course');
            }
        }
        catch(e)
        {
            return res.serverError(e);
        }
    }
};

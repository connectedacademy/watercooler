let pjson = require('../../package.json');
let os = require('os');
let URL = require('url').URL;

module.exports = {


    // testadminlogin: (req,res)=>
    // {
    //     req.session.redirecturi = req.get('origin') || req.get('referer');
    //     if (process.env.CI || req.query.psk == process.env.TESTKEY)
    //     {
    //         let testuser = require('../../spec/examples/adminuser.json');

    //         User.create(testuser).exec((err,user)=>{

    //             req.login(user, (err)=>
    //             {
    //                 // console.log(err);
    //                 return res.redirect(req.session.redirecturi + '/#/admin');
    //             });

    //         });
    //     }
    //     else
    //     {
    //         return res.forbidden('NOT IN CI OR TEST MODE');
    //     }
    // },

    testuserlogin: (req,res)=>{
        req.session.redirecturi = req.get('origin') || req.get('referer');
        if (process.env.CI || req.query.psk == process.env.TESTKEY)
        {
            let testuser = require('../../spec/examples/normaluser.json');

            User.create(testuser).exec((err,user)=>{
                // console.log()
                req.login(user, (err)=>
                {
                    // console.log(err);

                    return res.redirect(req.session.redirecturi + '/#/');
                });
            });
        }
        else
        {
             return res.forbidden('NOT IN CI OR TEST MODE');
        }
    },

    loginexistinguser: async (req,res)=>{
        req.session.redirecturi = req.query.callback || req.get('origin') || req.get('referer');

        if (process.env.CI || req.query.psk == process.env.TESTKEY)
        {

            let user = await User.findOne({
                account: req.query.account
            });

            req.login(user, (err)=>
            {
                return res.redirect(req.session.redirecturi + '/#/');
            });
        }
        else
        {
             return res.forbidden('NOT IN CI OR TEST MODE');
        }
    },

	root: async (req,res) =>
    {
        return res.json({
            msg:'Watercooler Running',
            version: pjson.version,
            host: os.hostname(),
            uptime: process.uptime()
        })
    },

    /**
     * 
     * @api {get} /v1/auth/logout Logout
     * @apiDescription Logout
     * @apiName logout
     * @apiGroup Authentication
     * @apiVersion  1.0.0
     * 
     */
    logout: (req, res) => {
        req.logout();
        return res.ok('Logged out successfully.');
    },

    twitter_callback: (req,res,next)=>{
        let success = (req.session.redirecturi + '/#/registration').replace('//#','/#');
        let fail = (req.session.redirecturi + '/#/loginfail').replace('//#','/#');
        sails.passport.authenticate('twitter',{successRedirect: success, failureRedirect: fail})(req,res,next);
    },

    /**
     * 
     * @api {get} /v1/auth/login Login
     * @apiDescription Login
     * @apiName login
     * @apiGroup Authentication
     * @apiVersion  1.0.0
     * 
     */
    login: (req,res,next) =>{
        //verify referer / origin, if valid, then allow and save into session
        // console.log(req.get('origin') || req.get('referer'));
        let url = new URL(req.get('origin') || req.get('referer'))
        // console.log(url.origin);
        req.session.redirecturi = url;
        sails.passport.authenticate('twitter')(req,res,next);
    },

    /**
     * 
     * @api {get} /v1/admin/login Login
     * @apiDescription Login
     * @apiName adminlogin
     * @apiGroup Admin
     * @apiVersion  1.0.0
     * 
     */
    admin: (req,res,next)=>{
        //verify referer / origin, if valid, then allow and save into session
        let url = new URL(req.get('origin') || req.get('referer'))
        req.session.redirecturi = url;
        // req.session.redirecturi = req.get('origin') || req.get('referer');
        sails.passport.authenticate('github')(req,res,next);
    },

    /**
     * 
     * @api {get} /v1/admin/logout Logout
     * @apiDescription Login
     * @apiName adminlogout
     * @apiGroup Admin
     * @apiVersion  1.0.0
     * 
     */
    admin_logout: (req,res)=>{
        req.logout();
        return res.ok('Logged out successfully.');
    },

    github_callback: (req,res,next)=>{
        let success = (req.session.redirecturi + '/#/admin').replace('//#','/#');
        let fail = (req.session.redirecturi + '/#/loginfail').replace('//#','/#');
        sails.passport.authenticate('github',{successRedirect: success, failureRedirect: fail })(req,res,next);
    },

    /**
     * 
     * @api {get} /v1/auth/me My Profile
     * @apiDescription Returns my profile and course registration
     * @apiName me
     * @apiGroup Authentication
     * @apiVersion  1.0.0
     * @apiPermission domainparse
     * 
     */
    me: async (req,res)=>{
        try
        {
            var user = await User.findOne(req.session.passport.user.id)
            .populate('owner')
            .populate('registrations',{
                course: req.course.domain
            });

            user.registration = _.first(user.registrations);
            user = _.omit(user,'registrations');

            let roles = ['user'];

            //normal admin
            if (_.includes(user.admin,req.course.domain))
                roles.push('admin');

            //owner
            if (user.owner && req.session.passport.allowedrepos && _.includes(req.session.passport.allowedrepos,req.course.repo))
            {
                roles.push('owner');
            }

            let codes = await Classroom.find({
                teacher: req.session.passport.user.id,
                course: req.course.domain
            });
            if (_.size(codes) > 0)
                roles.push('teacher');

            if (req.isSocket)
            {
                sails.log.verbose('Subscribed to WS for user',req.session.passport.user.id);
                User.subscribe(req,req.session.passport.user.id);
            }
            
            user.roles = roles;

            return res.json({
                user: user
            });
        }
        catch (e)
        {
            return res.serverError(e);
        }
    },

    /**
     * 
     * @api {post} /v1/auth/profile Update Profile
     * @apiDescription Updates current course profile
     * @apiName profile
     * @apiGroup Authentication
     * @apiVersion  1.0.0
     * @apiPermission domainparse
     * @apiPermission user
     * 
     * @apiParam  {String} email Email address
     * @apiParam  {String} lang Language code
     * @apiParam  {String} hub_id ID of the chosen hub
     * 
     */
    profile: async (req,res)=>{

        req.checkBody('email').isEmail();
        req.checkBody('lang').notEmpty();
        req.checkBody('hub_id').notEmpty();

        try
        {
            let result = await req.getValidationResult();
            result.throw();
        }
        catch (e)
        {
            return res.badRequest(e.mapped());
        }


        //check that lang is in the available list for this course:
        let course = await CacheEngine.getSpec(req);
        if (!_.contains(course.langs, req.body.lang))
        {
            return res.badRequest('Selected language not supported by this course. Available are ' + course.langs);
        }

        let hubs = await CacheEngine.getHubs(req);
        if (!_.contains(_.pluck(hubs,'id'), req.body.hub_id))
        {
            return res.badRequest('Selected hub not avaialable for this course. Available are ' + _.pluck(hubs,'id'));
        }

        try
        {
            var registration = await Registration.findOne({
                user:req.session.passport.user.id,
                course: req.course.domain
            }).populate('user');

            if (!registration)
                return res.notFound("Registration not found, have you registered?");

            registration.hub_id = req.body.hub_id;
            //get registration for this course and change lang
            registration.lang = req.body.lang;

            registration.user.email = req.body.email;

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

    /**
     * 
     * @api {get} /v1/auth/registrationquestions Registration Questions
     * @apiDescription Get list of questions to ask during registration
     * @apiName registrationquestions
     * @apiGroup Authentication
     * @apiVersion  1.0.0
     * @apiPermission domainparse
     * @apiPermission user
     * 
     */
    registrationquestions: async (req,res)=>{
        try
        {
            let questions = await CacheEngine.getQuestions(req,res);
            //randomly pick a question:
            let data = {
                release: questions.release,
                questions: questions.registration
            };
            return res.json(data);
        }
        catch (e)
        {
            return res.serverError(e);
        }
    },

    /**
     * 
     * @api {post} /v1/auth/register Register
     * @apiDescription Register for a course
     * @apiName register
     * @apiGroup Authentication
     * @apiVersion  1.0.0
     * @apiPermission domainparse
     * @apiPermission user
     * 
     * @apiParam  {String} email Email address
     * @apiParam  {String} lang Language code
     * @apiParam  {String} hub_id ID of the chosen hub
     * @apiParam  {String} age User age
     * @apiParam  {Boolean} consent Consent to the registration
     * @apiParam  {json} registration_info Additional registration information
     * 
     * 
     */
    register: async (req,res) =>{
        try
        {
            req.checkBody('email').isEmail();
            req.checkBody('lang').notEmpty();
            req.checkBody('hub_id').notEmpty();
            req.checkBody('age').optional().notEmpty();
            req.checkBody('registration_info').notEmpty();
            req.checkBody('consent').isBoolean();

            try
            {
                let result = await req.getValidationResult();
                result.throw();
            }
            catch (e)
            {
                return res.badRequest(e.mapped());
            }

            if (!req.body.consent)
                return res.badRequest('Consent not given');

             let course = await CacheEngine.getSpec(req);
            if (!_.contains(course.langs, req.body.lang))
            {
                return res.badRequest('Selected language not supported by this course. Available are ' + course.langs);
            }

            let hubs = await CacheEngine.getHubs(req);
            if (!_.contains(_.pluck(hubs,'id'), req.body.hub_id))
            {
                return res.badRequest('Selected hub not avaialable for this course. Available are ' + _.pluck(hubs,'id'));
            }

            let user = await User.findOne(req.session.passport.user.id).populate('registrations');

            console.log(req.session.passport.user.id);
            console.log(user);

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
                    {
                        NotificationEngine.signup(req,user);
                        return res.ok('Registration Complete');
                    }
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

let pjson = require('../../package.json');
let os = require('os');

module.exports = {


    testadminlogin: (req,res)=>
    {
        req.session.redirecturi = req.get('origin') || req.get('referer');
        if (process.env.CI)
        {
            let testuser = require('../../spec/examples/adminuser.json');
            req.login(testuser, (err)=>
            {
                // console.log(err);
                return res.redirect('/auth/admindashboard');
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
            req.login(testuser, (err)=>
            {
                // console.log(err);
                
                return res.redirect('/auth/dashboard');
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
        req.session.redirecturi = req.get('origin') || req.get('referer');
        sails.passport.authenticate('twitter')(req,res,next);
    },

    admin: (req,res,next)=>{
        //verify referer / origin, if valid, then allow and save into session
        req.session.redirecturi = req.get('origin') || req.get('referer');        
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
        return res.redirect(req.session.redirecturi + '#/dashboard');
    },

    admindashboard: (req,res)=>{
        return res.redirect(req.session.redirecturi + '#/admin');
    },

    fail: async (req,res)=>{
       return res.redirect(req.session.redirecturi + '#/loginfail');
    },

    me: async (req,res)=>{
        if (req.session.passport)
        {
            let user = await User.findOne(req.session.passport.user.id);
            delete user.credentials;
            delete user._raw;

            return res.json({
                user: (user.service=='twitter')? user : null,
                admin: (user.service=='github')? user : null
            });
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
            var user = await User.findOne(req.session.passport.user.id);
            user.hub_id = req.body.hub_id;
            user.lang = req.body.lang;
            user.save(function(err){
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

    register: async (req,res) =>{

        //TODO: add validation and check for needed fields:

        let user = await User.findOne(req.session.passport.user.id);

        //check there is not an existing registration for this course
        req.body.course = req.course.domain;
        user.registrations.add(req.body);
        
        user.save(function(err){
            if (err)
                return res.serverError(err);
            else
                return res.ok('Registration Complete');
        });
    }
};


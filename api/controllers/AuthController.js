let pjson = require('../..//package.json');
let os = require('os');

module.exports = {

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

    me: (req,res)=>{
        if (req.session.passport)
        {
            return res.json({
                user: (req.session.passport.user.service=='twitter')? req.session.passport.user : null,
                admin: (req.session.passport.user.service=='github')? req.session.passport.user : null
            })
        }
        else
        {
            return res.forbidden();
        }
    }
};


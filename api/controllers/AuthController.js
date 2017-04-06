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
        sails.passport.authenticate('github')(req,res,next);
    },

    admin_logout: (req,res,next)=>{
        req.logout();
        return res.ok('Logged out successfully.');
    },

    github_callback: (req,res,next)=>{
        sails.passport.authenticate('github',{successRedirect: '/auth/dashboard', failureRedirect: '/auth/fail' })(req,res,next);
    },

    dashboard: (req,res)=>{
        return res.redirect(req.session.redirecturi + '#/dashboard');    
    },

    fail: async (req,res)=>{
       return res.redirect(req.session.redirecturi + '#/loginfail');
    }
};


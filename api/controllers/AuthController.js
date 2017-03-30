/**
 * AuthController
 *
 * @description :: Server-side logic for managing Auths
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

// const passport = require('passport');

module.exports = {

	root: (req,res) =>
    {
        return res.json({
            msg:'Watercooler Running'
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
        sails.passport.authenticate('twitter')(req,res,next);
    },

    admin: (req,res,next)=>{
        sails.passport.authenticate('github')(req,res,next);
    },

    github_callback: (req,res,next)=>{
        sails.passport.authenticate('github',{successRedirect: '/auth/dashboard', failureRedirect: '/auth/fail' })(req,res,next);
    },

    dashboard: (req,res)=>{
        return res.json({
            msg:'Logged Into Admin -- replace with redirect to static content'
        });
    },

    fail: (req,res)=>{
        return res.status(403).json({
            msg: 'Failed to login -- replace with redirect to static content'
        })
    }
};


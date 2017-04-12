/**
 * Bootstrap
 * (sails.config.bootstrap)
 *
 * An asynchronous bootstrap function that runs before your Sails app gets lifted.
 * This gives you an opportunity to set up your data model, run jobs, or perform some special logic.
 *
 * For more information on bootstrapping your app, check out:
 * http://sailsjs.org/#!/documentation/reference/sails.config/sails.config.bootstrap.html
 */
let TwitterStrategy = require('passport-twitter');
let GitHubStrategy = require('passport-github');

module.exports.bootstrap = function(cb) {

  sails.passport = require('passport');


  sails.passport.use(new TwitterStrategy({
    consumerKey: process.env.TWITTER_KEY,
    consumerSecret: process.env.TWITTER_SECRET,
    callbackURL: process.env.HOST + "/auth/twitter_callback"
    },
    function(token, tokenSecret, profile, cb) {
        User.findOrCreate({ 
            service: profile.provider,
            account_number: profile.id
        },
        {
          account_number: profile.id,
          _raw: profile._json,
          credentials:{
            token:token,
            tokenSecret:tokenSecret
          },
          name: profile.displayName,
          service: profile.provider,
          account: profile.username,
          lang: profile._json.lang
        }, async function (err, user) {
            try
            {
              await user.save({
                _raw: profile._json,
                credentials:{
                  token:token,
                  tokenSecret:tokenSecret
                },
                name: profile.displayName,
                service: profile.provider,
                account: profile.username,
                lang: profile._json.lang
              });
              return cb(err, user);
            }
            catch (e)
            {
              return cb(err);
            }
        });
    }
  ));

  sails.passport.use(new GitHubStrategy({
    clientID: process.env.GITHUB_CLIENT_ID,
    clientSecret: process.env.GITHUB_CLIENT_SECRET,
    callbackURL: process.env.HOST + "/auth/github_callback"
  },
  function(accessToken, refreshToken, profile, cb) {
      User.findOrCreate({ 
            service: profile.provider,
            account_number: profile.id
        },
        {
          account_number: profile.id,
          _raw: profile._json,
          credentials:{
            accessToken:accessToken,
            refreshToken:refreshToken
          },
          name: profile.displayName,
          service: profile.provider,
          account: profile.username
        }, async function (err, user) {
          try
          {
            await user.save({
              _raw: profile._json,
              credentials:{
                accessToken:accessToken,
                refreshToken:refreshToken
              },
              name: profile.displayName,
              service: profile.provider,
              account: profile.username
            });
            return cb(err, user);
          }
          catch (e)
          {
            return cb(err);
          }
      });
  }
  ));



  sails.passport.serializeUser(function (user, done) {
	  done(null, user);
	});

  sails.passport.deserializeUser(function (user, done) {
	    done(null, user);
	});
  
  cb();
};

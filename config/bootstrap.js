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

  // It's very important to trigger this callback method when you are finished
  // with the bootstrap!  (otherwise your server will never lift, since it's waiting on the bootstrap)


  sails.passport = require('passport');


  sails.passport.use(new TwitterStrategy({
    consumerKey: process.env.TWITTER_KEY,
    consumerSecret: process.env.TWITTER_SECRET,
    callbackURL: "http://127.0.0.1:4000/auth/twitter_callback"
    },
    function(token, tokenSecret, profile, cb) {
        User.findOrCreate({ 
            twitterId: profile.id
        }, function (err, user) {
            return cb(err, user);
        });
    }
  ));

  sails.passport.use(new GitHubStrategy({
    clientID: process.env.GITHUB_CLIENT_ID,
    clientSecret: process.env.GITHUB_CLIENT_SECRET,
    callbackURL: "http://127.0.0.1:4000/auth/github_callback"
  },
  function(accessToken, refreshToken, profile, cb) {
    User.findOrCreate({ githubId: profile.id }, function (err, user) {
      return cb(err, user);
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

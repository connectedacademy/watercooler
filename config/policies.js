var passport = require('passport');
module.exports.policies = {
    '*':['jsononly'],
    'auth':
    {
        'login':[true],
        'admin':[true],
        'twitter_callback':[true],
        'github_callback':[true]
    }
};
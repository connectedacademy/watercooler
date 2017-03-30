var passport = require('passport');
module.exports.policies = {
    '*':['verifyDomain','jsononly'],
    'auth':
    {
        'root':[true],
        'login':[true],
        'admin':[true],
        'twitter_callback':[true],
        'github_callback':[true],
        'dashboard':[true],
        'fail':[true],
        'logout':[true],
        'admin_logout':[true]
    }
};
var passport = require('passport');
module.exports.policies = {
    '*':['verifyDomain','jsononly','cors'],
    'auth':
    {
        'root':[true],
        'login':[true],
        'admin':[true],
        'twitter_callback':[true],
        'github_callback':[true],
        'dashboard':['isUser',true],
        'fail':[true],
        'logout':[true],
        'admin_logout':[true]
    },
    'admin':
    {
        '*':['isAdmin']
    },
    'messages':
    {
        '*':['isUser']
    },
    'classroom':
    {
        '*':['isUser']
    }
};
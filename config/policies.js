var passport = require('passport');
module.exports.policies = {
    '*':['verifyDomain','jsononly','cors'],
    'auth':
    {
        'root':[true],
        'login':['verifyDomain'],
        'admin':['verifyDomain'],
        'twitter_callback':[true],
        'github_callback':[true],
        'dashboard':['isUser',true],
        'fail':[true],
        'logout':[true],
        'admin_logout':[true]
    },
    'admin':
    {
        '*':['isAdmin','verifyDomain','jsononly','cors']
    },
    'messages':
    {
        '*':['isUser','verifyDomain','jsononly','cors']
    },
    'classroom':
    {
        '*':['isUser','verifyDomain','jsononly','cors']
    }
};
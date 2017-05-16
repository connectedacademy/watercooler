var passport = require('passport');
module.exports.policies = {
    '*':['verifyDomain','jsononly','cors'],
    'auth':
    {
        'root':['jsononly'],
        'login':['verifyDomain'],
        'admin':['verifyDomain'],
        'twitter_callback':[true],
        'github_callback':[true],
        'dashboard':['isUser',true],
        'admindashboard':['verifyDomain','isAdmin',true],
        'fail':[true],
        'logout':['cors'],
        'admin_logout':[true],
        'me':['verifyDomain','jsononly','cors'],
        'profile':['isUser','verifyDomain','jsononly','cors'],
        'register':['isUser','verifyDomain','jsononly','cors'],
        'registrationquestions':['isUser','verifyDomain','jsononly','cors'],
        'testadminlogin':['verifyDomain'],
        'testuserlogin':['verifyDomain']
    },
    'admin':
    {
        '*':['verifyDomain','isAdmin','jsononly','cors'],
        'editor':['verifyDomain'],
        'root':['verifyDomain','isAdmin','cors'],
        'clearcache':true
    },
    'messages':
    {
        '*':['cors','isUser','verifyDomain','jsononly'],
        'list':['cors','verifyDomain','jsononly'],
        'likes':['cors','verifyDomain','jsononly'],
        'visualisation':['cors','verifyDomain','jsononly'],
        'summary':['cors','verifyDomain','jsononly']          
    },
    'classroom':
    {
        '*':['isUser','verifyDomain','jsononly','cors']
    },
    'analytics':
    {
        'submit':['isUser','verifyDomain','jsononly','cors'],
        'question':['isUser','verifyDomain','jsononly','cors'],
        'answers':['verifyDomain','isAdmin','jsononly','cors']
    },
    'discussion':{
        '*':['isUser','verifyDomain','jsononly','cors'],
        'subscribe':['socketonly','isUser','verifyDomain','jsononly','cors']
    }
};

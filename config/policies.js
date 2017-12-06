var passport = require('passport');
module.exports.policies = {
    '*':['verifyDomain','jsononly','cors'],
    'course':{
        'like':['isUser','verifyDomain','jsononly','cors'],
        'unlike':['isUser','verifyDomain','jsononly','cors']
    },
    'auth':
    {
        'root':['jsononly'],
        'login':['verifyDomain'],
        'admin':['verifyDomain', 'isUser'],
        'twitter_callback':[true],
        'github_callback':[true],
        'dashboard':['isUser',true],
        'fail':[true],
        'logout':['cors'],
        'admin_logout':[true],
        'me':['verifyDomain','jsononly','cors','isUser'],
        'profile':['isUser','verifyDomain','jsononly','cors'],
        'register':['isUser','verifyDomain','jsononly','cors'],
        'registrationquestions':['isUser','verifyDomain','jsononly','cors'],
        'testuserlogin':['verifyDomain'],
        'loginexistinguser':['verifyDomain']
    },
    'admin':
    {
        '*':['verifyDomain','isAdmin','jsononly','cors'],
        'editor':['verifyDomain'],
        'root':['verifyDomain','isAdmin','cors'],
        'classes':['verifyDomain','cors','isRegistered','isUser'],
        'users':['verifyDomain','cors','isUser'],
        'classusers':['verifyDomain','cors','isAdmin'],
        'content':['verifyDomain','cors','isUser'],
        'credentials':['verifyDomain','cors','isOwner'],
        'makeadmin':['verifyDomain','cors','isOwner'],
        'messages':['verifyDomain','cors','isAdmin'],
        'classmessages':['verifyDomain','cors','isUser'],
        'mymessages':['verifyDomain','cors','isUser'],
        'mycontent':['verifyDomain','cors','isUser'],
        'clearcache':true,
        'allclasses':['verifyDomain','cors','isAdmin'],
        'content':['verifyDomain','cors','isAdmin'],
        'classcontent':['verifyDomain','cors','isUser']
    },
    'messages':
    {
        '*':['cors','isUser','verifyDomain','jsononly'],
        'list':['cors','verifyDomain','jsononly'],
        'likes':['cors','verifyDomain','jsononly'],
        'visualisation':['cors','verifyDomain','jsononly'],
        'summary':['cors','verifyDomain','jsononly'],
        'summarybatch':['cors','verifyDomain','jsononly'],
        'subscribe':['cors','verifyDomain','jsononly','socketonly'],
        'unsubscribe':['cors','verifyDomain','jsononly','socketonly'],
        'content':['cors','verifyDomain','jsononly']
    },
    'classroom':
    {
        '*':['isUser','verifyDomain','jsononly','cors'],
        'rss':[true]
    },
    'analytics':
    {
        'submit':['isUser','verifyDomain','jsononly','cors'],
        'question':['isUser','verifyDomain','jsononly','cors'],
        'answers':['verifyDomain','isAdmin','jsononly','cors'],
        'log':['verifyDomain','cors']
    },
    'discussion':{
        '*':['isUser','verifyDomain','jsononly','cors'],
        'subscribe':['socketonly','isUser','verifyDomain','jsononly','cors'],
        'thumbnail':true
    },
    'moderation':{
        '*':['jsononly','cors','verifyDomain','isAdmin'],
        'report':['jsononly','cors','verifyDomain','isUser'],
    }
};

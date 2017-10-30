/**
 * Route Mappings
 * (sails.config.routes)
 *
 * Your routes map URLs to views and controllers.
 *
 * If Sails receives a URL that doesn't match any of the routes below,
 * it will check for matching files (images, scripts, stylesheets, etc.)
 * in your assets directory.  e.g. `http://localhost:1337/images/foo.jpg`
 * might match an image file: `/assets/images/foo.jpg`
 *
 * Finally, if those don't match either, the default 404 handler is triggered.
 * See `api/responses/notFound.js` to adjust your app's 404 logic.
 *
 * Note: Sails doesn't ACTUALLY serve stuff from `assets`-- the default Gruntfile in Sails copies
 * flat files from `assets` to `.tmp/public`.  This allows you to do things like compile LESS or
 * CoffeeScript for the front-end.
 *
 * For more information on configuring custom routes, check out:
 * http://sailsjs.org/#!/documentation/concepts/Routes/RouteTargetSyntax.html
 */

module.exports.routes = {
  '/': 'AuthController.root',

  '/clearcache':'AdminController.clearcache',

  'GET /auth/twitter_callback':'AuthController.twitter_callback',
  'GET /auth/github_callback':'AuthController.github_callback',

  'GET /v1/course/hubs':'CourseController.hubs',
  'GET /v1/course/schedule':'CourseController.schedule',  
  'GET /v1/course/spec/:class':'CourseController.spec',
  'GET /v1/course/specpreload/:class/:blocks':'CourseController.specpreload',  
  'POST /v1/course/like/:class/:content':'CourseController.like',
  'POST /v1/course/unlike/:class/:content':'CourseController.unlike',  

  'GET /v1/auth/login':'AuthController.login',
  'GET /v1/auth/logout':'AuthController.logout',
  'GET /v1/auth/me':'AuthController.me',
  'POST /v1/auth/profile':'AuthController.profile',
  'POST /v1/auth/register':'AuthController.register',
  'GET /v1/auth/registrationquestions':'AuthController.registrationquestions',
  
  'GET /v1/admin/login':'AuthController.admin',
  'GET /v1/admin/editor':'AdminController.editor',
  'POST /v1/admin/credentials':'AdminController.credentials',
  'GET /v1/admin/dash':'AdminController.root',
  'POST /v1/admin/makeadmin':'AdminController.makeadmin',

  'GET /v1/profile/content/:class?':'AdminController.content',
  'GET /v1/profile/users/:class?':'AdminController.users',
  'GET /v1/profile/classes':'AdminController.classes',
  'GET /v1/profile/messages/:class?/:user?':'AdminController.messages',
  'GET /v1/profile/mymessages/:class?':'AdminController.mymessages',
  'GET /v1/profile/mycontent/:class?':'AdminController.mycontent',
  

  'GET /v1/classroom/getclass/:class':'ClassroomController.getclass',  
  'GET /v1/classroom/mycode/:class':'ClassroomController.mycode',
  // 'GET /v1/classroom/users/:class/:content':'ClassroomController.users',
  'POST /v1/classroom/inclass':'ClassroomController.inclass',
  'GET /v1/classroom/rss/:code':'ClassroomController.rss',


  'GET /v1/messages/visualisation/:class/:content/:groupby/:limit?':'MessagesController.visualisation',
  'GET /v1/messages/likes/:class/:content':'MessagesController.likes',
  'GET /v1/messages/list/:class/:content/:startsegment/:endsegment':'MessagesController.list',
  'GET /v1/messages/content/:class/:content':'MessagesController.content',  
  'GET /v1/messages/subscribe/:class/:content/:startsegment/:endsegment':'MessagesController.subscribe',
  'GET /v1/messages/unsubscribe':'MessagesController.unsubscribe',  
  'POST /v1/messages/create':'MessagesController.create',
  'GET /v1/messages/summary/:class/:content/:startsegment/:endsegment':'MessagesController.summary',
  'GET /v1/messages/summarybatch/:class/:content/:startsegment/:endsegment/:groupsize':'MessagesController.summarybatch',

  'POST /v1/analytics/answer/response':'AnalyticsController.submit',
  'GET /v1/analytics/answers':'AnalyticsController.answers',
  'GET /v1/analytics/question/:class/:content':'AnalyticsController.question',

  'POST /v1/analytics/log':'AnalyticsController.log',


  // 'GET /v1/auth/testadminlogin':'AuthController.testadminlogin',
  'GET /v1/auth/testuserlogin':'AuthController.testuserlogin',
  'GET /v1/auth/loginexistinguser':'AuthController.loginexistinguser',  
  

  // DISCUSSION MODULE

  'GET /v1/discussion/available/:class/:content':'DiscussionController.available',
  'POST /v1/discussion/create/:submission':'DiscussionController.create',
  'GET /v1/discussion/messages/:submission':'DiscussionController.messages',
  'GET /v1/discussion/submission/:submission':'DiscussionController.submission',  
  'GET /v1/discussion/list/:class/:content':'DiscussionController.list',
  'POST /v1/discussion/read/:message':'DiscussionController.read',
  'GET /v1/discussion/user/:class/:content/:user':'Discussion.user',
  'POST /v1/discussion/remove':'DiscussionController.remove',  

  'OPTIONS /*':{policy:'cors'}
};

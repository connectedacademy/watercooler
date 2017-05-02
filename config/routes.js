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
  'GET /auth/twitter_callback':'AuthController.twitter_callback',
  'GET /auth/github_callback':'AuthController.github_callback',

  'GET /v1/course/hubs':'CourseController.hubs',
  'GET /v1/course/spec':'CourseController.spec',

  'GET /v1/auth/login':'AuthController.login',
  'GET /v1/auth/logout':'AuthController.logout',
  'GET /v1/auth/dashboard':'AuthController.dashboard',
  'GET /v1/auth/admindashboard':'AuthController.admindashboard',  
  'GET /v1/auth/fail':'AuthController.fail',
  'GET /v1/auth/me':'AuthController.me',
  'POST /v1/auth/profile':'AuthController.profile',
  'POST /v1/auth/register':'AuthController.register',
  'GET /v1/auth/registrationquestions':'AuthController.registrationquestions',
  

  'GET /v1/admin/login':'AuthController.admin',
  'GET /v1/admin/logout':'AuthController.admin_logout',  
  'GET /v1/admin/editor':'AdminController.editor',
  'POST /v1/admin/credentials':'AdminController.credentials',
  'GET /v1/admin/content':'AdminController.content',
  'GET /v1/admin/users':'AdminController.users',
  'GET /v1/admin/dash':'AdminController.root',
  
  'GET /v1/classroom/mycode/:class/:content':'ClassroomController.mycode',
  'GET /v1/classroom/users/:class/:content':'ClassroomController.users',
  'POST /v1/classroom/inclass':'ClassroomController.inclass',
  

  'GET /v1/messages/visualisation/:class/:segment':'MessagesController.visualisation',
  'GET /v1/messages/likes/:class/:content':'MessagesController.likes',
  'GET /v1/messages/list/:class/:content/:startsegment/:endsegment':'MessagesController.list',
  'GET /v1/messages/subscribe/:class/:content/:startsegment/:endsegment':'MessagesController.subscribe',
  'POST /v1/messages/create':'MessagesController.create',

  'POST /v1/analytics/answer/response':'AnalyticsController.submit',
  'GET /v1/analytics/answers':'AnalyticsController.answers',
  'GET /v1/analytics/question/:class/:content':'AnalyticsController.question',


  'GET /v1/auth/testadminlogin':'AuthController.testadminlogin',
  'GET /v1/auth/testuserlogin':'AuthController.testuserlogin',
  

  // DISCUSSION MODULE

  'GET /v1/discussion/available/:class/:schedule':'DiscussionController.available',
  'GET /v1/discussion/subscribe/:media':'DiscussionController.subscribe',
  'POST /v1/discussion/create/:media':'DiscussionController.create',
  'GET /v1/discussion/messages/:media':'DiscussionController.messages',
  'GET /v1/discussion/submission/:media':'DiscussionController.submission',
  'GET /v1/discussion/list/:class/:schedule':'DiscussionController.list',
  'POST /v1/discussion/read/:message':'DiscussionController.read',

  'OPTIONS /*':{policy:'cors'}
};

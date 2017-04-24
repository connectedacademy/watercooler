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

  'GET /course/spec':'CourseController.spec',
  'GET /course/hubs':'CourseController.hubs',

  'GET /auth/login':'AuthController.login',
  'GET /auth/logout':'AuthController.logout',
  'GET /auth/twitter_callback':'AuthController.twitter_callback',
  'GET /auth/github_callback':'AuthController.github_callback',
  'GET /auth/dashboard':'AuthController.dashboard',
  'GET /auth/admindashboard':'AuthController.admindashboard',  
  'GET /auth/fail':'AuthController.fail',
  'GET /auth/me':'AuthController.me',
  'POST /auth/profile':'AuthController.profile',
  'POST /auth/register':'AuthController.register',
  'GET /auth/registrationquestions':'AuthController.registrationquestions',
  

  'GET /admin/login':'AuthController.admin',
  'GET /admin/logout':'AuthController.admin_logout',  
  'GET /admin/editor':'AdminController.editor',
  'POST /admin/credentials':'AdminController.credentials',
  'GET /admin/content':'AdminController.content',
  'GET /admin/users':'AdminController.users',
  'GET /admin/dash':'AdminController.root',
  
  'GET /classroom/mycode/:hub/:class':'ClassroomController.mycode',
  'GET /classroom/users/:hub/:class':'ClassroomController.users',

  'GET /messages/visualisation/:class/:segment':'MessagesController.visualisation',
  'GET /messages/likes/:uri':'MessagesController.likes',
  'GET /messages/list/:class/:content/:startsegment/:endsegment':'MessagesController.list',
  'GET /messages/subscribe/:class/:content/:startsegment/:endsegment':'MessagesController.subscribe',
  'POST /messages/create':'MessagesController.create',

  'POST /analytics/answer/response':'AnalyticsController.submit',
  'GET /analytics/answers':'AnalyticsController.answers',
  'GET /analytics/question/:class/:content':'AnalyticsController.question',


  'GET /auth/testadminlogin':'AuthController.testadminlogin',
  'GET /auth/testuserlogin':'AuthController.testuserlogin',
  

  // DISCUSSION MODULE

  'GET /discussion/available/:class/:schedule':'DiscussionController.available',
  'GET /discussion/subscribe/:media':'DiscussionController.subscribe',
  'POST /discussion/create/:media':'DiscussionController.create',
  'GET /discussion/messages/:media':'DiscussionController.messages',
  'GET /discussion/submission/:media':'DiscussionController.submission',
  'GET /discussion/list/:class/:schedule':'DiscussionController.list',
  'POST /discussion/read/:message':'DiscussionController.read',

  'OPTIONS /*':{policy:'cors'}
};

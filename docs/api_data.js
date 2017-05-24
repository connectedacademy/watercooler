define({ "api": [
  {
    "type": "get",
    "url": "/v1/admin/login",
    "title": "Login",
    "description": "<p>Login</p>",
    "name": "adminlogin",
    "group": "Admin",
    "version": "1.0.0",
    "filename": "./api/controllers/AuthController.js",
    "groupTitle": "Admin",
    "sampleRequest": [
      {
        "url": "https://api.connectedacademy.io/v1/admin/login"
      }
    ]
  },
  {
    "type": "get",
    "url": "/v1/admin/logout",
    "title": "Logout",
    "description": "<p>Login</p>",
    "name": "adminlogout",
    "group": "Admin",
    "version": "1.0.0",
    "filename": "./api/controllers/AuthController.js",
    "groupTitle": "Admin",
    "sampleRequest": [
      {
        "url": "https://api.connectedacademy.io/v1/admin/logout"
      }
    ]
  },
  {
    "type": "get",
    "url": "/clearcache",
    "title": "Clear Cache",
    "name": "clearcache",
    "group": "Admin",
    "version": "1.0.0",
    "filename": "./api/controllers/AdminController.js",
    "groupTitle": "Admin",
    "sampleRequest": [
      {
        "url": "https://api.connectedacademy.io/clearcache"
      }
    ]
  },
  {
    "type": "get",
    "url": "/v1/admin/content/:class/:content",
    "title": "Submissions",
    "description": "<p>List all submission content for a specific class and content segment</p>",
    "name": "content",
    "group": "Admin",
    "version": "1.0.0",
    "permission": [
      {
        "name": "domainparse",
        "title": "Domain Dependent",
        "description": ""
      },
      {
        "name": "admin",
        "title": "Authenticated as Admin",
        "description": ""
      }
    ],
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "class",
            "description": "<p>Class slug</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "content",
            "description": "<p>Content slug</p>"
          }
        ]
      }
    },
    "filename": "./api/controllers/AdminController.js",
    "groupTitle": "Admin",
    "sampleRequest": [
      {
        "url": "https://api.connectedacademy.io/v1/admin/content/:class/:content"
      }
    ]
  },
  {
    "type": "post",
    "url": "/v1/admin/credentials",
    "title": "Edit Credentials",
    "description": "<p>Enter social media application credentials for a specfic course</p>",
    "name": "credentials",
    "group": "Admin",
    "version": "1.0.0",
    "permission": [
      {
        "name": "domainparse",
        "title": "Domain Dependent",
        "description": ""
      },
      {
        "name": "admin",
        "title": "Authenticated as Admin",
        "description": ""
      }
    ],
    "filename": "./api/controllers/AdminController.js",
    "groupTitle": "Admin",
    "sampleRequest": [
      {
        "url": "https://api.connectedacademy.io/v1/admin/credentials"
      }
    ]
  },
  {
    "type": "get",
    "url": "/v1/admin/editor",
    "title": "Content Editor",
    "description": "<p>Redirect to prose.io for editing the current course.</p>",
    "name": "editor",
    "group": "Admin",
    "version": "1.0.0",
    "permission": [
      {
        "name": "domainparse",
        "title": "Domain Dependent",
        "description": ""
      },
      {
        "name": "admin",
        "title": "Authenticated as Admin",
        "description": ""
      }
    ],
    "filename": "./api/controllers/AdminController.js",
    "groupTitle": "Admin",
    "sampleRequest": [
      {
        "url": "https://api.connectedacademy.io/v1/admin/editor"
      }
    ]
  },
  {
    "type": "get",
    "url": "/v1/admin/users",
    "title": "Users",
    "description": "<p>List all users registered for this course</p>",
    "name": "users",
    "group": "Admin",
    "version": "1.0.0",
    "permission": [
      {
        "name": "domainparse",
        "title": "Domain Dependent",
        "description": ""
      },
      {
        "name": "admin",
        "title": "Authenticated as Admin",
        "description": ""
      }
    ],
    "filename": "./api/controllers/AdminController.js",
    "groupTitle": "Admin",
    "sampleRequest": [
      {
        "url": "https://api.connectedacademy.io/v1/admin/users"
      }
    ]
  },
  {
    "type": "post",
    "url": "/v1/analytics/answers",
    "title": "List Answers",
    "description": "<p>List all answers to all questions</p>",
    "name": "answers",
    "group": "Analytics",
    "version": "1.0.0",
    "permission": [
      {
        "name": "domainparse",
        "title": "Domain Dependent",
        "description": ""
      },
      {
        "name": "admin",
        "title": "Authenticated as Admin",
        "description": ""
      }
    ],
    "filename": "./api/controllers/AnalyticsController.js",
    "groupTitle": "Analytics",
    "sampleRequest": [
      {
        "url": "https://api.connectedacademy.io/v1/analytics/answers"
      }
    ]
  },
  {
    "type": "get",
    "url": "/v1/analytics/question/:class/:content",
    "title": "Get Question",
    "description": "<p>Get a single question relevant to this section of content</p>",
    "name": "question",
    "group": "Analytics",
    "version": "1.0.0",
    "permission": [
      {
        "name": "domainparse",
        "title": "Domain Dependent",
        "description": ""
      },
      {
        "name": "user",
        "title": "Authenticated as User",
        "description": ""
      }
    ],
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "class",
            "description": "<p>Class slug</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "content",
            "description": "<p>Content slug</p>"
          }
        ]
      }
    },
    "filename": "./api/controllers/AnalyticsController.js",
    "groupTitle": "Analytics",
    "sampleRequest": [
      {
        "url": "https://api.connectedacademy.io/v1/analytics/question/:class/:content"
      }
    ]
  },
  {
    "type": "post",
    "url": "/v1/analytics/submit",
    "title": "Submit Answer",
    "description": "<p>Submit an answer to a question</p>",
    "name": "submitanswer",
    "group": "Analytics",
    "version": "1.0.0",
    "permission": [
      {
        "name": "domainparse",
        "title": "Domain Dependent",
        "description": ""
      },
      {
        "name": "user",
        "title": "Authenticated as User",
        "description": ""
      }
    ],
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "class",
            "description": "<p>Class slug</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "content",
            "description": "<p>Content slug</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "question_id",
            "description": "<p>ID of the question being answered</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "answer",
            "description": "<p>The answer to the question</p>"
          }
        ]
      }
    },
    "filename": "./api/controllers/AnalyticsController.js",
    "groupTitle": "Analytics",
    "sampleRequest": [
      {
        "url": "https://api.connectedacademy.io/v1/analytics/submit"
      }
    ]
  },
  {
    "type": "get",
    "url": "/v1/auth/login",
    "title": "Login",
    "description": "<p>Login</p>",
    "name": "login",
    "group": "Authentication",
    "version": "1.0.0",
    "filename": "./api/controllers/AuthController.js",
    "groupTitle": "Authentication",
    "sampleRequest": [
      {
        "url": "https://api.connectedacademy.io/v1/auth/login"
      }
    ]
  },
  {
    "type": "get",
    "url": "/v1/auth/logout",
    "title": "Logout",
    "description": "<p>Logout</p>",
    "name": "logout",
    "group": "Authentication",
    "version": "1.0.0",
    "filename": "./api/controllers/AuthController.js",
    "groupTitle": "Authentication",
    "sampleRequest": [
      {
        "url": "https://api.connectedacademy.io/v1/auth/logout"
      }
    ]
  },
  {
    "type": "get",
    "url": "/v1/auth/me",
    "title": "My Profile",
    "description": "<p>Returns my profile and course registration</p>",
    "name": "me",
    "group": "Authentication",
    "version": "1.0.0",
    "permission": [
      {
        "name": "domainparse",
        "title": "Domain Dependent",
        "description": ""
      }
    ],
    "filename": "./api/controllers/AuthController.js",
    "groupTitle": "Authentication",
    "sampleRequest": [
      {
        "url": "https://api.connectedacademy.io/v1/auth/me"
      }
    ]
  },
  {
    "type": "post",
    "url": "/v1/auth/profile",
    "title": "Update Profile",
    "description": "<p>Updates current course profile</p>",
    "name": "profile",
    "group": "Authentication",
    "version": "1.0.0",
    "permission": [
      {
        "name": "domainparse",
        "title": "Domain Dependent",
        "description": ""
      },
      {
        "name": "user",
        "title": "Authenticated as User",
        "description": ""
      }
    ],
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "email",
            "description": "<p>Email address</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "lang",
            "description": "<p>Language code</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "hub_id",
            "description": "<p>ID of the chosen hub</p>"
          }
        ]
      }
    },
    "filename": "./api/controllers/AuthController.js",
    "groupTitle": "Authentication",
    "sampleRequest": [
      {
        "url": "https://api.connectedacademy.io/v1/auth/profile"
      }
    ]
  },
  {
    "type": "post",
    "url": "/v1/auth/register",
    "title": "Register",
    "description": "<p>Register for a course</p>",
    "name": "register",
    "group": "Authentication",
    "version": "1.0.0",
    "permission": [
      {
        "name": "domainparse",
        "title": "Domain Dependent",
        "description": ""
      },
      {
        "name": "user",
        "title": "Authenticated as User",
        "description": ""
      }
    ],
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "email",
            "description": "<p>Email address</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "lang",
            "description": "<p>Language code</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "hub_id",
            "description": "<p>ID of the chosen hub</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "age",
            "description": "<p>User age</p>"
          },
          {
            "group": "Parameter",
            "type": "Boolean",
            "optional": false,
            "field": "consent",
            "description": "<p>Consent to the registration</p>"
          },
          {
            "group": "Parameter",
            "type": "json",
            "optional": false,
            "field": "registration_info",
            "description": "<p>Additional registration information</p>"
          }
        ]
      }
    },
    "filename": "./api/controllers/AuthController.js",
    "groupTitle": "Authentication",
    "sampleRequest": [
      {
        "url": "https://api.connectedacademy.io/v1/auth/register"
      }
    ]
  },
  {
    "type": "get",
    "url": "/v1/auth/registrationquestions",
    "title": "Registration Questions",
    "description": "<p>Get list of questions to ask during registration</p>",
    "name": "registrationquestions",
    "group": "Authentication",
    "version": "1.0.0",
    "permission": [
      {
        "name": "domainparse",
        "title": "Domain Dependent",
        "description": ""
      },
      {
        "name": "user",
        "title": "Authenticated as User",
        "description": ""
      }
    ],
    "filename": "./api/controllers/AuthController.js",
    "groupTitle": "Authentication",
    "sampleRequest": [
      {
        "url": "https://api.connectedacademy.io/v1/auth/registrationquestions"
      }
    ]
  },
  {
    "type": "get",
    "url": "/v1/classroom/getclass/:class/:content",
    "title": "My Classroom",
    "description": "<p>Get status on ths current user in a classroom</p>",
    "name": "getclass",
    "group": "Classroom",
    "version": "1.0.0",
    "permission": [
      {
        "name": "domainparse",
        "title": "Domain Dependent",
        "description": ""
      },
      {
        "name": "user",
        "title": "Authenticated as User",
        "description": ""
      }
    ],
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "class",
            "description": "<p>Class slug</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "content",
            "description": "<p>Content slug</p>"
          }
        ]
      }
    },
    "filename": "./api/controllers/ClassroomController.js",
    "groupTitle": "Classroom",
    "sampleRequest": [
      {
        "url": "https://api.connectedacademy.io/v1/classroom/getclass/:class/:content"
      }
    ]
  },
  {
    "type": "post",
    "url": "/v1/classroom/inclass",
    "title": "Register Attendance",
    "description": "<p>Register attendance in this classroom</p>",
    "name": "inclass",
    "group": "Classroom",
    "version": "1.0.0",
    "permission": [
      {
        "name": "domainparse",
        "title": "Domain Dependent",
        "description": ""
      },
      {
        "name": "user",
        "title": "Authenticated as User",
        "description": ""
      }
    ],
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "code",
            "description": "<p>Classroom code provided by the teacher</p>"
          }
        ]
      }
    },
    "filename": "./api/controllers/ClassroomController.js",
    "groupTitle": "Classroom",
    "sampleRequest": [
      {
        "url": "https://api.connectedacademy.io/v1/classroom/inclass"
      }
    ]
  },
  {
    "type": "get",
    "url": "/v1/classroom/mycode/:class/:content",
    "title": "My Teacher Code",
    "description": "<p>Get the code to give to students if I am a teacher</p>",
    "name": "mycode",
    "group": "Classroom",
    "version": "1.0.0",
    "permission": [
      {
        "name": "domainparse",
        "title": "Domain Dependent",
        "description": ""
      },
      {
        "name": "user",
        "title": "Authenticated as User",
        "description": ""
      }
    ],
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "class",
            "description": "<p>Class slug</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "content",
            "description": "<p>Content slug</p>"
          }
        ]
      }
    },
    "filename": "./api/controllers/ClassroomController.js",
    "groupTitle": "Classroom",
    "sampleRequest": [
      {
        "url": "https://api.connectedacademy.io/v1/classroom/mycode/:class/:content"
      }
    ]
  },
  {
    "type": "get",
    "url": "/v1/classroom/users/:class/:content",
    "title": "List Students",
    "description": "<p>Get a list of students who have registered in this classroom</p>",
    "name": "users",
    "group": "Classroom",
    "version": "1.0.0",
    "permission": [
      {
        "name": "domainparse",
        "title": "Domain Dependent",
        "description": ""
      },
      {
        "name": "user",
        "title": "Authenticated as User",
        "description": ""
      }
    ],
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "class",
            "description": "<p>Class slug</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "content",
            "description": "<p>Content slug</p>"
          }
        ]
      }
    },
    "filename": "./api/controllers/ClassroomController.js",
    "groupTitle": "Classroom",
    "sampleRequest": [
      {
        "url": "https://api.connectedacademy.io/v1/classroom/users/:class/:content"
      }
    ]
  },
  {
    "type": "get",
    "url": "/v1/course/hubs",
    "title": "Hubs",
    "description": "<p>Get the list of hubs for this course</p>",
    "name": "hubs",
    "group": "Course",
    "version": "1.0.0",
    "permission": [
      {
        "name": "domainparse",
        "title": "Domain Dependent",
        "description": ""
      }
    ],
    "filename": "./api/controllers/CourseController.js",
    "groupTitle": "Course",
    "sampleRequest": [
      {
        "url": "https://api.connectedacademy.io/v1/course/hubs"
      }
    ]
  },
  {
    "type": "get",
    "url": "/v1/course/schedule",
    "title": "Schedule",
    "description": "<p>Get the schedule for this course</p>",
    "name": "schedule",
    "group": "Course",
    "version": "1.0.0",
    "permission": [
      {
        "name": "domainparse",
        "title": "Domain Dependent",
        "description": ""
      }
    ],
    "filename": "./api/controllers/CourseController.js",
    "groupTitle": "Course",
    "sampleRequest": [
      {
        "url": "https://api.connectedacademy.io/v1/course/schedule"
      }
    ]
  },
  {
    "type": "get",
    "url": "/v1/course/spec/:class",
    "title": "Class List",
    "description": "<p>Get the content list for this class</p>",
    "name": "spec",
    "group": "Course",
    "version": "1.0.0",
    "permission": [
      {
        "name": "domainparse",
        "title": "Domain Dependent",
        "description": ""
      }
    ],
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "class",
            "description": "<p>Class slug</p>"
          }
        ]
      }
    },
    "filename": "./api/controllers/CourseController.js",
    "groupTitle": "Course",
    "sampleRequest": [
      {
        "url": "https://api.connectedacademy.io/v1/course/spec/:class"
      }
    ]
  },
  {
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "optional": false,
            "field": "varname1",
            "description": "<p>No type.</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "varname2",
            "description": "<p>With type.</p>"
          }
        ]
      }
    },
    "type": "",
    "url": "",
    "version": "0.0.0",
    "filename": "./docs/main.js",
    "group": "D__Research_connectedacademy_watercooler_docs_main_js",
    "groupTitle": "D__Research_connectedacademy_watercooler_docs_main_js",
    "name": ""
  },
  {
    "type": "post",
    "url": "/v1/discussion/available/:class/:content",
    "title": "Submissions Needing Feedback",
    "description": "<p>Gets a list of submissions that require feedback</p>",
    "name": "available",
    "group": "Discussion",
    "version": "1.0.0",
    "permission": [
      {
        "name": "domainparse",
        "title": "Domain Dependent",
        "description": ""
      },
      {
        "name": "user",
        "title": "Authenticated as User",
        "description": ""
      }
    ],
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "class",
            "description": "<p>Class slug</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "content",
            "description": "<p>Content slug</p>"
          }
        ]
      }
    },
    "filename": "./api/controllers/DiscussionController.js",
    "groupTitle": "Discussion",
    "sampleRequest": [
      {
        "url": "https://api.connectedacademy.io/v1/discussion/available/:class/:content"
      }
    ]
  },
  {
    "type": "post",
    "url": "/v1/discussion/create",
    "title": "New Feedback Message",
    "description": "<p>Create a new message in a discussion</p>",
    "name": "discussioncreate",
    "group": "Discussion",
    "version": "1.0.0",
    "permission": [
      {
        "name": "domainparse",
        "title": "Domain Dependent",
        "description": ""
      },
      {
        "name": "user",
        "title": "Authenticated as User",
        "description": ""
      }
    ],
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "submission",
            "description": "<p>Submission ID</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "text",
            "description": "<p>Text of the message</p>"
          }
        ]
      }
    },
    "filename": "./api/controllers/DiscussionController.js",
    "groupTitle": "Discussion",
    "sampleRequest": [
      {
        "url": "https://api.connectedacademy.io/v1/discussion/create"
      }
    ]
  },
  {
    "type": "get",
    "url": "/v1/discussion/list/:class/:content",
    "title": "Get My Submissions",
    "description": "<p>Returns list of discussions I am participating in for this class and content segment</p>",
    "name": "discussionlist",
    "group": "Discussion",
    "version": "1.0.0",
    "permission": [
      {
        "name": "domainparse",
        "title": "Domain Dependent",
        "description": ""
      },
      {
        "name": "user",
        "title": "Authenticated as User",
        "description": ""
      }
    ],
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "class",
            "description": "<p>Class slug</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "content",
            "description": "<p>Content slug</p>"
          }
        ]
      }
    },
    "filename": "./api/controllers/DiscussionController.js",
    "groupTitle": "Discussion",
    "sampleRequest": [
      {
        "url": "https://api.connectedacademy.io/v1/discussion/list/:class/:content"
      }
    ]
  },
  {
    "type": "get",
    "url": "/v1/discussion/messages/:submission",
    "title": "Get Messages",
    "description": "<p>Return message thread for a submission</p>",
    "name": "discussionmessages",
    "group": "Discussion",
    "version": "1.0.0",
    "permission": [
      {
        "name": "domainparse",
        "title": "Domain Dependent",
        "description": ""
      },
      {
        "name": "user",
        "title": "Authenticated as User",
        "description": ""
      }
    ],
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "submission",
            "description": "<p>Submission ID</p>"
          }
        ]
      }
    },
    "filename": "./api/controllers/DiscussionController.js",
    "groupTitle": "Discussion",
    "sampleRequest": [
      {
        "url": "https://api.connectedacademy.io/v1/discussion/messages/:submission"
      }
    ]
  },
  {
    "type": "post",
    "url": "/v1/discussion/read",
    "title": "Mark Read",
    "description": "<p>Mark a message as read by this user</p>",
    "name": "discussionread",
    "group": "Discussion",
    "version": "1.0.0",
    "permission": [
      {
        "name": "domainparse",
        "title": "Domain Dependent",
        "description": ""
      },
      {
        "name": "user",
        "title": "Authenticated as User",
        "description": ""
      }
    ],
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "message",
            "description": "<p>Message ID</p>"
          }
        ]
      }
    },
    "filename": "./api/controllers/DiscussionController.js",
    "groupTitle": "Discussion",
    "sampleRequest": [
      {
        "url": "https://api.connectedacademy.io/v1/discussion/read"
      }
    ]
  },
  {
    "type": "get",
    "url": "/v1/discussion/submission/:submission",
    "title": "Get Submission",
    "description": "<p>Return a specific submission</p>",
    "name": "discussionsubmission",
    "group": "Discussion",
    "version": "1.0.0",
    "permission": [
      {
        "name": "domainparse",
        "title": "Domain Dependent",
        "description": ""
      },
      {
        "name": "user",
        "title": "Authenticated as User",
        "description": ""
      }
    ],
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "submission",
            "description": "<p>Submission ID</p>"
          }
        ]
      }
    },
    "filename": "./api/controllers/DiscussionController.js",
    "groupTitle": "Discussion",
    "sampleRequest": [
      {
        "url": "https://api.connectedacademy.io/v1/discussion/submission/:submission"
      }
    ]
  },
  {
    "type": "socket.io",
    "url": "/v1/discussion/subscribe/:submission",
    "title": "Subscribe to Updates",
    "description": "<p>Subscribe to live message updates for this discussion</p>",
    "name": "discussionsubscribe",
    "group": "Discussion",
    "version": "1.0.0",
    "permission": [
      {
        "name": "domainparse",
        "title": "Domain Dependent",
        "description": ""
      },
      {
        "name": "user",
        "title": "Authenticated as User",
        "description": ""
      }
    ],
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "submission",
            "description": "<p>Submission ID</p>"
          }
        ]
      }
    },
    "filename": "./api/controllers/DiscussionController.js",
    "groupTitle": "Discussion",
    "sampleRequest": [
      {
        "url": "https://api.connectedacademy.io/v1/discussion/subscribe/:submission"
      }
    ]
  },
  {
    "type": "post",
    "url": "/v1/messages/create",
    "title": "New Message",
    "description": "<p>Create a new message</p>",
    "name": "message_create",
    "group": "Messages",
    "version": "1.0.0",
    "permission": [
      {
        "name": "domainparse",
        "title": "Domain Dependent",
        "description": ""
      },
      {
        "name": "user",
        "title": "Authenticated as User",
        "description": ""
      }
    ],
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "text",
            "description": "<p>Contents of message</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "replyto",
            "description": "<p>Message to reply to</p>"
          }
        ]
      }
    },
    "filename": "./api/controllers/MessagesController.js",
    "groupTitle": "Messages",
    "sampleRequest": [
      {
        "url": "https://api.connectedacademy.io/v1/messages/create"
      }
    ]
  },
  {
    "type": "get",
    "url": "/v1/messages/list/:class/:content",
    "title": "Likes",
    "description": "<p>Return number of likes for a specific item of content</p>",
    "name": "message_likes",
    "group": "Messages",
    "version": "1.0.0",
    "permission": [
      {
        "name": "domainparse",
        "title": "Domain Dependent",
        "description": ""
      },
      {
        "name": "user",
        "title": "Authenticated as User",
        "description": ""
      }
    ],
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "class",
            "description": "<p>Content slug</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "content",
            "description": "<p>Content slug</p>"
          }
        ]
      }
    },
    "filename": "./api/controllers/MessagesController.js",
    "groupTitle": "Messages",
    "sampleRequest": [
      {
        "url": "https://api.connectedacademy.io/v1/messages/list/:class/:content"
      }
    ]
  },
  {
    "type": "get",
    "url": "/v1/messages/list/:class/:content/:startsegment/:endsegment",
    "title": "List",
    "description": "<p>List messages that this user should be viewing in this segment range</p>",
    "name": "message_list",
    "group": "Messages",
    "version": "1.0.0",
    "permission": [
      {
        "name": "domainparse",
        "title": "Domain Dependent",
        "description": ""
      },
      {
        "name": "user",
        "title": "Authenticated as User",
        "description": ""
      }
    ],
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "class",
            "description": "<p>Content slug</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "content",
            "description": "<p>Content slug</p>"
          },
          {
            "group": "Parameter",
            "type": "Number",
            "optional": false,
            "field": "startsegment",
            "description": "<p>Starting segment number</p>"
          },
          {
            "group": "Parameter",
            "type": "Number",
            "optional": false,
            "field": "endsegment",
            "description": "<p>Ending segment number</p>"
          },
          {
            "group": "Parameter",
            "type": "Boolean",
            "optional": false,
            "field": "whitelist",
            "description": "<p>Use only registered users messages</p>"
          },
          {
            "group": "Parameter",
            "type": "Number",
            "optional": false,
            "field": "depth",
            "description": "<p>Number of messages to return</p>"
          }
        ]
      }
    },
    "filename": "./api/controllers/MessagesController.js",
    "groupTitle": "Messages",
    "sampleRequest": [
      {
        "url": "https://api.connectedacademy.io/v1/messages/list/:class/:content/:startsegment/:endsegment"
      }
    ]
  },
  {
    "type": "socket.io",
    "url": "/v1/messages/subscribe/:class/:content/:startsegment/:endsegment",
    "title": "Subscribe to Range",
    "description": "<p>Subscribe to a segment range for new messages that this user should be viewing</p>",
    "name": "message_subscribe",
    "group": "Messages",
    "version": "1.0.0",
    "permission": [
      {
        "name": "domainparse",
        "title": "Domain Dependent",
        "description": ""
      },
      {
        "name": "user",
        "title": "Authenticated as User",
        "description": ""
      }
    ],
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "class",
            "description": "<p>Content slug</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "content",
            "description": "<p>Content slug</p>"
          },
          {
            "group": "Parameter",
            "type": "Number",
            "optional": false,
            "field": "startsegment",
            "description": "<p>Starting segment number</p>"
          },
          {
            "group": "Parameter",
            "type": "Number",
            "optional": false,
            "field": "endsegment",
            "description": "<p>Ending segment number</p>"
          },
          {
            "group": "Parameter",
            "type": "Boolean",
            "optional": false,
            "field": "whitelist",
            "description": "<p>Use only registered users messages</p>"
          }
        ]
      }
    },
    "filename": "./api/controllers/MessagesController.js",
    "groupTitle": "Messages",
    "sampleRequest": [
      {
        "url": "https://api.connectedacademy.io/v1/messages/subscribe/:class/:content/:startsegment/:endsegment"
      }
    ]
  },
  {
    "type": "get",
    "url": "/v1/messages/summary/:class/:content/:startsegment/:endsegment",
    "title": "Summary",
    "description": "<p>Return single message and totals for given segment range</p>",
    "name": "message_summary",
    "group": "Messages",
    "version": "1.0.0",
    "permission": [
      {
        "name": "domainparse",
        "title": "Domain Dependent",
        "description": ""
      },
      {
        "name": "user",
        "title": "Authenticated as User",
        "description": ""
      }
    ],
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "class",
            "description": "<p>Content slug</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "content",
            "description": "<p>Content slug</p>"
          },
          {
            "group": "Parameter",
            "type": "Number",
            "optional": false,
            "field": "startsegment",
            "description": "<p>Starting segment number</p>"
          },
          {
            "group": "Parameter",
            "type": "Number",
            "optional": false,
            "field": "endsegment",
            "description": "<p>Ending segment number</p>"
          },
          {
            "group": "Parameter",
            "type": "Boolean",
            "optional": false,
            "field": "whitelist",
            "description": "<p>Use only registered users messages</p>"
          }
        ]
      }
    },
    "filename": "./api/controllers/MessagesController.js",
    "groupTitle": "Messages",
    "sampleRequest": [
      {
        "url": "https://api.connectedacademy.io/v1/messages/summary/:class/:content/:startsegment/:endsegment"
      }
    ]
  },
  {
    "type": "get",
    "url": "/v1/messages/summarybatch/:class/:content/:startsegment/:endsegment/:groupsize",
    "title": "Batch Summary",
    "description": "<p>Return single message for each grouped segment and totals for given segment range</p>",
    "name": "message_summarybatch",
    "group": "Messages",
    "version": "1.0.0",
    "permission": [
      {
        "name": "domainparse",
        "title": "Domain Dependent",
        "description": ""
      },
      {
        "name": "user",
        "title": "Authenticated as User",
        "description": ""
      }
    ],
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "class",
            "description": "<p>Content slug</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "content",
            "description": "<p>Content slug</p>"
          },
          {
            "group": "Parameter",
            "type": "Number",
            "optional": false,
            "field": "startsegment",
            "description": "<p>Starting segment number</p>"
          },
          {
            "group": "Parameter",
            "type": "Number",
            "optional": false,
            "field": "endsegment",
            "description": "<p>Ending segment number</p>"
          },
          {
            "group": "Parameter",
            "type": "Number",
            "optional": false,
            "field": "groupsize",
            "description": "<p>Size to group segments</p>"
          },
          {
            "group": "Parameter",
            "type": "Boolean",
            "optional": false,
            "field": "whitelist",
            "description": "<p>Use only registered users messages</p>"
          }
        ]
      }
    },
    "filename": "./api/controllers/MessagesController.js",
    "groupTitle": "Messages",
    "sampleRequest": [
      {
        "url": "https://api.connectedacademy.io/v1/messages/summarybatch/:class/:content/:startsegment/:endsegment/:groupsize"
      }
    ]
  },
  {
    "type": "get",
    "url": "/v1/messages/visualisation/:class/:content",
    "title": "Visualisation",
    "description": "<p>Visualisation of message activity for each segment</p>",
    "name": "message_visualisation",
    "group": "Messages",
    "version": "1.0.0",
    "permission": [
      {
        "name": "domainparse",
        "title": "Domain Dependent",
        "description": ""
      },
      {
        "name": "user",
        "title": "Authenticated as User",
        "description": ""
      }
    ],
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "class",
            "description": "<p>Content slug</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "content",
            "description": "<p>Content slug</p>"
          },
          {
            "group": "Parameter",
            "type": "Boolean",
            "optional": false,
            "field": "whitelist",
            "description": "<p>Limit to messages from registered users</p>"
          }
        ]
      }
    },
    "filename": "./api/controllers/MessagesController.js",
    "groupTitle": "Messages",
    "sampleRequest": [
      {
        "url": "https://api.connectedacademy.io/v1/messages/visualisation/:class/:content"
      }
    ]
  }
] });
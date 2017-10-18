define({ "api": [
  {
    "type": "get",
    "url": "/v1/admin/messages/:class?/:user?",
    "title": "Messages",
    "description": "<p>List all messages for this course, if a teacher is logged in, only show ones from their classes.</p>",
    "name": "admin_messages",
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
      },
      {
        "name": "teacher",
        "title": "Is a teacher (generated a code)",
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
            "description": "<p>(optional) Class slug</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "user",
            "description": "<p>(optional) User ID</p>"
          }
        ]
      }
    },
    "filename": "./api/controllers/AdminController.js",
    "groupTitle": "Admin",
    "sampleRequest": [
      {
        "url": "https://api.connectedacademy.io/v1/admin/messages/:class?/:user?"
      }
    ]
  },
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
    "url": "/v1/admin/classes",
    "title": "Classes",
    "description": "<p>List all classes for this course, if a teacher is logged in, only show ones they taught.</p>",
    "name": "classes",
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
      },
      {
        "name": "teacher",
        "title": "Is a teacher (generated a code)",
        "description": ""
      }
    ],
    "filename": "./api/controllers/AdminController.js",
    "groupTitle": "Admin",
    "sampleRequest": [
      {
        "url": "https://api.connectedacademy.io/v1/admin/classes"
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
      },
      {
        "name": "teacher",
        "title": "Is a teacher (generated a code)",
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
    "url": "/v1/admin/makeadmin",
    "title": "Make Admin",
    "description": "<p>Make this user an admin</p>",
    "name": "makeadmin",
    "group": "Admin",
    "version": "1.0.0",
    "permission": [
      {
        "name": "domainparse",
        "title": "Domain Dependent",
        "description": ""
      },
      {
        "name": "owner",
        "title": "Authenticated as Owner of Course (Github Access)",
        "description": ""
      }
    ],
    "filename": "./api/controllers/AdminController.js",
    "groupTitle": "Admin",
    "sampleRequest": [
      {
        "url": "https://api.connectedacademy.io/v1/admin/makeadmin"
      }
    ]
  },
  {
    "type": "get",
    "url": "/v1/admin/users/:class?",
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
    "filename": "./api/controllers/AdminController.js",
    "groupTitle": "Admin",
    "sampleRequest": [
      {
        "url": "https://api.connectedacademy.io/v1/admin/users/:class?"
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
    "type": "post",
    "url": "/v1/analytics/log",
    "title": "Log",
    "description": "<p>Log anything from client</p>",
    "name": "log",
    "group": "Analytics",
    "version": "1.0.0",
    "permission": [
      {
        "name": "domainparse",
        "title": "Domain Dependent",
        "description": ""
      }
    ],
    "filename": "./api/controllers/AnalyticsController.js",
    "groupTitle": "Analytics",
    "sampleRequest": [
      {
        "url": "https://api.connectedacademy.io/v1/analytics/log"
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
        "title": "Authenticated as Student on the Course",
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
    "url": "/v1/analytics/answer/response",
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
        "title": "Authenticated as Student on the Course",
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
        "url": "https://api.connectedacademy.io/v1/analytics/answer/response"
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
        "title": "Authenticated as Student on the Course",
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
        "title": "Authenticated as Student on the Course",
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
        "title": "Authenticated as Student on the Course",
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
    "url": "/v1/classroom/getclass/:class",
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
        "title": "Authenticated as Student on the Course",
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
        "url": "https://api.connectedacademy.io/v1/classroom/getclass/:class"
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
        "title": "Authenticated as Student on the Course",
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
    "url": "/v1/classroom/mycode/:class",
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
        "title": "Authenticated as Student on the Course",
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
    "filename": "./api/controllers/ClassroomController.js",
    "groupTitle": "Classroom",
    "sampleRequest": [
      {
        "url": "https://api.connectedacademy.io/v1/classroom/mycode/:class"
      }
    ]
  },
  {
    "type": "get",
    "url": "/v1/classroom/rss/{code}",
    "title": "RSS Feed",
    "description": "<p>RSS feed of the relevant content for a particular class to be used by the teacher to generate a (storify) narrative.</p>",
    "name": "rss",
    "group": "Classroom",
    "version": "1.0.0",
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
        "url": "https://api.connectedacademy.io/v1/classroom/rss/{code}"
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
    "type": "post",
    "url": "/v1/course/like/:class/:content",
    "title": "Like",
    "description": "<p>Like the content</p>",
    "name": "like",
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
        "url": "https://api.connectedacademy.io/v1/course/like/:class/:content"
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
    "type": "get",
    "url": "/v1/course/specpreload/:class/:blocks",
    "title": "Class List Preload",
    "description": "<p>Get the pre-load content list for this class</p>",
    "name": "specpreload",
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
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "blocks",
            "description": "<p>Number of blocks to load (-1 is all)</p>"
          }
        ]
      }
    },
    "filename": "./api/controllers/CourseController.js",
    "groupTitle": "Course",
    "sampleRequest": [
      {
        "url": "https://api.connectedacademy.io/v1/course/specpreload/:class/:blocks"
      }
    ]
  },
  {
    "type": "post",
    "url": "/v1/course/unlike/:class/:content",
    "title": "Un-Like",
    "description": "<p>Like the content</p>",
    "name": "unlike",
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
        "url": "https://api.connectedacademy.io/v1/course/unlike/:class/:content"
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
        "title": "Authenticated as Student on the Course",
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
    "url": "/v1/discussion/create/:submission",
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
        "title": "Authenticated as Student on the Course",
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
        "url": "https://api.connectedacademy.io/v1/discussion/create/:submission"
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
        "title": "Authenticated as Student on the Course",
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
        "title": "Authenticated as Student on the Course",
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
        "title": "Authenticated as Student on the Course",
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
        "title": "Authenticated as Student on the Course",
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
    "type": "get",
    "url": "/v1/discussion/user/:class/:content/:user",
    "title": "User Submissions",
    "description": "<p>List submissions for this user</p>",
    "name": "discussionuser",
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
        "title": "Authenticated as Student on the Course",
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
            "field": "user",
            "description": "<p>User ID</p>"
          }
        ]
      }
    },
    "filename": "./api/controllers/DiscussionController.js",
    "groupTitle": "Discussion",
    "sampleRequest": [
      {
        "url": "https://api.connectedacademy.io/v1/discussion/user/:class/:content/:user"
      }
    ]
  },
  {
    "type": "post",
    "url": "/v1/discussion/remove",
    "title": "Remove Submission",
    "description": "<p>Removes a specific submission for any reason</p>",
    "name": "rmsubmission",
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
        "title": "Authenticated as Student on the Course",
        "description": ""
      }
    ],
    "filename": "./api/controllers/DiscussionController.js",
    "groupTitle": "Discussion",
    "sampleRequest": [
      {
        "url": "https://api.connectedacademy.io/v1/discussion/remove"
      }
    ]
  },
  {
    "type": "get",
    "url": "/v1/messages/content/:class/:content",
    "title": "Content Messages",
    "description": "<p>List messages for a specific piece of content, and subscribe to new ones</p>",
    "name": "message_content",
    "group": "Messages",
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
            "description": "<p>Use only registered users messages</p>"
          },
          {
            "group": "Parameter",
            "type": "Number",
            "optional": false,
            "field": "limit",
            "description": "<p>Number of messages to return</p>"
          }
        ]
      }
    },
    "filename": "./api/controllers/MessagesController.js",
    "groupTitle": "Messages",
    "sampleRequest": [
      {
        "url": "https://api.connectedacademy.io/v1/messages/content/:class/:content"
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
        "title": "Authenticated as Student on the Course",
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
        "title": "Authenticated as Student on the Course",
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
        "title": "Authenticated as Student on the Course",
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
        "title": "Authenticated as Student on the Course",
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
        "title": "Authenticated as Student on the Course",
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
        "title": "Authenticated as Student on the Course",
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
    "type": "socket.io",
    "url": "/v1/messages/unsubscribe",
    "title": "Unsubscribe",
    "description": "<p>Unsubscribe to all message based socket events</p>",
    "name": "message_unsubscribe",
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
        "title": "Authenticated as Student on the Course",
        "description": ""
      }
    ],
    "filename": "./api/controllers/MessagesController.js",
    "groupTitle": "Messages",
    "sampleRequest": [
      {
        "url": "https://api.connectedacademy.io/v1/messages/unsubscribe"
      }
    ]
  },
  {
    "type": "get",
    "url": "/v1/messages/visualisation/:class/:content/:groupby",
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
        "title": "Authenticated as Student on the Course",
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
            "type": "int",
            "optional": false,
            "field": "groupby",
            "description": "<p>Number of segments to group by</p>"
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
        "url": "https://api.connectedacademy.io/v1/messages/visualisation/:class/:content/:groupby"
      }
    ]
  }
] });

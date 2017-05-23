define({ "api": [
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
  }
] });

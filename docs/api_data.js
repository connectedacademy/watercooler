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
    "url": "/admin/editor",
    "title": "Content Editor",
    "name": "editor",
    "group": "Admin",
    "version": "1.0.0",
    "filename": "./api/controllers/AdminController.js",
    "groupTitle": "Admin",
    "sampleRequest": [
      {
        "url": "https://api.connectedacademy.io/admin/editor"
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

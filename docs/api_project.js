define({
  "name": "Watercooler",
  "version": "1.0.0",
  "description": "API documentation for the Watercooler API",
  "title": "Connected Academy Watercooler API",
  "url": "https://api.connectedacademy.io",
  "sampleUrl": "https://api.connectedacademy.io",
  "template": {
    "withGenerator": false,
    "withCompare": false
  },
  "header": {
    "title": "Watercooler API",
    "content": "<h1>Connected Academy</h1>\n<p>This documentation is a work in progress...</p>\n<h2>Socket Messages</h2>\n<p>All messages come back with the following:</p>\n<pre><code class=\"language-json\">{\n    &quot;msgtype&quot;: &quot;message&quot;, // message|classroom|discussion\n    &quot;msg&quot;: ...\n}\n</code></pre>\n<h3>Discussion Messages</h3>\n<p>Subcriptions are created for user related information when the following is called:</p>\n<p><code>/v1/auth/me</code></p>\n<p>Emits <code>discussion</code> messages on new peer discussion messages.</p>\n<h3>Dashboard</h3>\n<p>Subscriptions for all messages coming in during a class:</p>\n<p><code>/v1/classroom/mycode/:class</code></p>\n<p>Emits <code>classroom</code> messages on new user registrations, or <code>message</code> messages on new comments from students in your classroom.</p>\n<h3>Message Subscriptions</h3>\n<p>For a time window:</p>\n<p><code>/v1/messages/subscribe/:class/:content/:startsegment/:endsegment</code></p>\n<p>For static content (i.e. webinar):</p>\n<p><code>/v1/messages/content/:class/:content</code></p>\n"
  },
  "defaultVersion": "0.0.0",
  "apidoc": "0.3.0",
  "generator": {
    "name": "apidoc",
    "time": "2017-11-08T13:56:30.569Z",
    "url": "http://apidocjs.com",
    "version": "0.17.6"
  }
});

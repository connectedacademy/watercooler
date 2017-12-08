# Connected Academy

This documentation is a work in progress...

## Socket Messages

All messages come back with the following:

```json
{
    "msgtype": "message", // message|classroom|discussion|visupdate
    "msg": ...
}
```

### Discussion Messages

Subcriptions are created for user related information when the following is called:

`/v1/auth/me`

Emits `discussion` messages on new peer discussion messages.

### Dashboard

Subscriptions for all messages coming in during a class:

`/v1/classroom/mycode/:class`

Emits `classroom` messages on new user registrations, or `message` messages on new comments from students in your classroom.

### Message Subscriptions

For a time window:

`/v1/messages/subscribe/:class/:content/:startsegment/:endsegment`

For static content (i.e. webinar):

`/v1/messages/content/:class/:content`

### Visualisation Updates

For liveclass visualisation updates:

`/v1/messages/visualisation/:class/:content/:groupby/:limit?whitelist=true`

Emits `visupdate` messages throttled on new messages related to the liveclass.
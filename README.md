# Connected Academy API (watercooler)

[![Docker Pulls](https://img.shields.io/docker/pulls/connectedacademy/watercooler.svg)](https://hub.docker.com/r/connectedacademy/watercooler/)

Backend JSON REST and Websocket API for Connected Academy providing endpoints for auth, data access and message posting.

> Remember to use `npm version` before any push in order to get the Dockerfile to build.

## Development

This app depends on:

- Redis
- OrientDB
- Beanstalk

## Configuration

Watercooler requires the following ENV variables set:

```
HOST=http://localhost:4000
LOGZ_TOKEN=
DEBUG_MODE=true
LIVE_DATA=true
TESTKEY=
ORIENTDB_HOST=orientdb
ORIENTDB_PORT=2424
ORIENTDB_USERNAME=
ORIENTDB_PASSWORD=
ORIENTDB_DB=connectedacademy
REDIS_HOST=redis
REDIS_PORT=6379
TWITTER_KEY=
TWITTER_SECRET=
GITHUB_CLIENT_ID=
GITHUB_CLIENT_SECRET=
MASTER_REPO=https://connectedacademy.io/
EDITOR_URI=http://prose.io/
TEST_DOMAIN=https://interpretation.connectedacademy.io
GOSSIPMILL_PSK=
GOSSIPMILL_URL=http://gossipmill:1337/
SENDGRID_KEY=
FROM_EMAIL=noreply@connectedacademy.io
FROM_NAME=Connected Academy
SCHEDULER_RATE=3600000
DEFAULT_LANG=en
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
AWS_DEFAULT_REGION=eu-west-1
```

----
This project is part of the [Connected Academy](https://connectedacademy.io) online learning platform developed by [Open Lab](https://openlab.ncl.ac.uk) @ Newcastle University
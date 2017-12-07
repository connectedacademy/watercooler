const requestify = require('requestify');
const OAuth2 = require('oauth').OAuth2;
const moment = require('moment');

module.exports = function (sails) {

    let run = async function () {

        try {
            var oauth2 = new OAuth2(process.env.TWITTER_KEY, process.env.TWITTER_SECRET, 'https://api.twitter.com/', null, 'oauth2/token', null);

            let access_token = await new Promise(function (resolve, reject) {
                oauth2.getOAuthAccessToken('', {
                    'grant_type': 'client_credentials'
                }, function (e, access_token) {
                    if (e)
                        return reject(e);
                    else
                        return resolve(access_token);
                });
            });

            // console.log("accesstoken: "+access_token);

            sails.log.verbose('Refreshing Twitter Profiles');
            let users = await User.find({ service: 'twitter' });

            //REMEMBER -- CALLS TO TWITTER ARE RATE LIMITED AT 900 EVERY 15 MINS!

            for (let user of users) {
                try {
                    //attempt to get profile image:
                    let profile_resp = await requestify.request(user.profile, { method: 'HEAD' });
                    // if (true)
                    if (profile_resp.code != 200 && profile_resp.code != 301) {
                        let resp = await requestify.get(`https://api.twitter.com/1.1/users/show.json?screen_name=${user.account}&include_entities=false`, {
                            headers: {
                                Authorization: 'Bearer ' + access_token
                            }
                        });

                        if (resp.code == 200) {

                            let json = JSON.parse(resp.body);
                            // console.log(json.profile_image_url_https);
                            user['_raw'] = json;
                            user.profile = json.profile_image_url_https;
                            sails.log.verbose('ProfileImageUpdate', user.id, json.profile_image_url_https);
                            await new Promise((resolve) => {
                                user.save(function (err) {
                                    resolve();
                                });
                            });
                        }
                    }

                    let lastupdate = _.last(user.history);

                    if (moment(lastupdate.updatedAt).isAfter(moment().add(15, 'min'))) {

                        let resp = await requestify.get(`https://api.twitter.com/1.1/users/show.json?screen_name=${user.account}&include_entities=false`, {
                            headers: {
                                Authorization: 'Bearer ' + access_token
                            }
                        });

                        if (resp.code == 200) {

                            let json = JSON.parse(resp.body);

                            let newobj = _.pick(json, ['followers_count', 'friends_count', 'listed_count', 'favourites_count', 'statuses_count']);

                            if (!user.history)
                                user.history = [];

                            let lastobj = _.omit(lastupdate, 'updatedAt', '@type');

                            if (!_.isEqual(lastobj, newobj)) {
                                newobj.updatedAt = new Date();
                                user.history.push(newobj);
                                sails.log.verbose('ProfileStatsUpdate', user.id);
                                await new Promise((resolve) => {
                                    user.save(function (err) {
                                        resolve();
                                    });
                                });
                            }

                        }
                    }
                }
                catch (e) {
                    sails.log.error('ProfileUpdateFail', user.id, e);
                }
            }

            sails.log.verbose('Refreshed Twitter Profiles');
        } catch (e) {
            sails.log.error(e);
        }
    };

    return {
        configure: function () {
            //EACH HOUR
            sails.on('lifted', function () {
                let interval = Math.min(2147483647, Math.round((parseInt(process.env.SCHEDULER_RATE)) + (Math.random() * 5000)));
                this.schedule = setInterval(run, interval);
                run();
            });
        }
    };
}
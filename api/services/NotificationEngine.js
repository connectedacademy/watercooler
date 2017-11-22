let helper = require('sendgrid').mail;
let sg = require('sendgrid')(process.env.SENDGRID_KEY);
let fs = require('fs-promise');

let sendEmail = async function (user, subject, content) {

    var from_email = new helper.Email(process.env.FROM_EMAIL, process.env.FROM_NAME);
    var to_email = new helper.Email(user.email);
    var subject = subject;

    let template = await fs.readFile(__dirname + '/../../views/email.html');
    let realcontent = template.toString().replace('{{body}}', content)
    realcontent = realcontent.replace('{{user}}', user.name);
    realcontent = realcontent.replace('{{date}}', new Date().toString());

    var content = new helper.Content('text/html', realcontent);
    var mail = new helper.Mail(from_email, subject, to_email, content);

    var request = sg.emptyRequest({
        method: 'POST',
        path: '/v3/mail/send',
        body: mail.toJSON(),
    });

    sg.API(request, function (error, response) {
        if (error)
            sails.log.error(error);
        else
            sails.log.verbose('Mail Sent', response);
    });
};

let hasSent = async function (course, ...ident) {
    // console.log(course + "::" + ident.join('-'));
    let result = await Notifications.findOne({
        course: course,
        ident: ident.join('-')
    });
    if (result)
        return true;
    else
        return false;
}

let markSent = async function (course, ...ident) {
    return new Promise((resolve, reject) => {
        Notifications.create({
            course: course,
            ident: ident.join('-')
        }).exec((err) => {
            if (err)
                reject(err);
            else
                resolve();
        });
    });
}

module.exports = {

    //welcome to the course
    signup: async (req, user) => {
        try {
            sails.log.verbose('Sending signup notification', user.id);
            let lang = await LangService.lang(req);
            let email = await CacheEngine.getEmail(req.course, lang, 'intro');
            await sendEmail(user, email.subject, email.body);
        }
        catch (e) {
            sails.log.error(e);
        }
    },

    // course starting (1 week before)
    weekBefore: async (course) => {
        try {
            if (!await hasSent(course.domain, 'weekbefore')) {
                sails.log.verbose('Sending weekbefore notification', course.domain);

                let registrations = await Registration.find({
                    course: course.domain
                }).populate('user');

                for (let reg of registrations) {
                    let email = await CacheEngine.getEmail(course, reg.lang || process.env.DEFAULT_LANG, 'coursestarting_week');
                    sendEmail(reg.user, email.subject, email.body);
                }
                await markSent(course.domain, 'weekbefore');
            }
        }
        catch (e) {
            sails.log.error(e);
        }
    },

    // course starting (day before)
    dayBefore: async (course) => {
        try {
            if (!await hasSent(course.domain, 'daybefore')) {
                sails.log.verbose('Sending daybefore notification', course.domain);

                let registrations = await Registration.find({
                    course: course.domain
                }).populate('user');

                for (let reg of registrations) {
                    let email = await CacheEngine.getEmail(course, reg.lang || process.env.DEFAULT_LANG, 'coursestarting_day');
                    sendEmail(reg.user, email.subject, email.body);
                }
                await markSent(course.domain, 'daybefore');
            }
        }
        catch (e) {
            sails.log.error(e);
        }
    },

    // Final questionaire push
    courseClose: async (course) => {
        try {
            if (!await hasSent(course.domain, 'courseclose')) {
                sails.log.verbose('Sending courseclose notification', course.domain);

                let registrations = await Registration.find({
                    course: course.domain
                }).populate('user');

                for (let reg of registrations) {
                    let email = await CacheEngine.getEmail(course, reg.lang || process.env.DEFAULT_LANG, 'courseclose');
                    sendEmail(reg.user, email.subject, email.body);
                }
                await markSent(course.domain, 'courseclose');
            }
        }
        catch (e) {
            sails.log.error(e);
        }
    },

    // read pre-content
    readPreContent: async (course, klass) => {
        try {
            //
            if (!await hasSent(course.domain, 'precontent', klass)) {
                sails.log.verbose('Sending precontent notification', course.domain, klass);

                let registrations = await Registration.find({
                    course: course.domain
                }).populate('user');

                for (let reg of registrations) {
                    let email = await CacheEngine.getEmail(course, reg.lang || process.env.DEFAULT_LANG, 'readprecontent');
                    sendEmail(reg.user, email.subject, email.body);
                }

                await markSent(course.domain, 'precontent', klass);
            }
        }
        catch (e) {
            sails.log.error(e);
        }
    },

    // post your submission e.g. 4c
    submitWork: async (course, currentClass, user) => {
        try {
            if (!await hasSent(course.domain, 'submitwork', currentClass, user.id)) {
                sails.log.verbose('Sending submitwork notification', course.domain, currentClass, user);

                let reg = await Registration.findOne({
                    course: course.domain,
                    user: user.id
                }).populate('user');

                if (reg)
                {
                    let email = await CacheEngine.getEmail(course, reg.lang || process.env.DEFAULT_LANG, 'postsubmission');
                    sendEmail(reg.user, email.subject, email.body);
                }

                await markSent(course.domain, 'submitwork', currentClass, user.id);
            }
        }
        catch (e) {
            sails.log.error(e);
        }
    },

    // you should submit feedback
    submitFeedback: async (course, currentClass, user, content) => {
        try {
            if (!await hasSent(course.domain, 'submitfeedback', currentClass+'-'+content, user.id)) {

                sails.log.verbose('Sending submitfeedback notification', course.domain,  currentClass, user, content);
                
                let reg = await Registration.findOne({
                    course: course.domain,
                    user: user.id
                }).populate('user');

                if (reg)
                {
                    let email = await CacheEngine.getEmail(course, reg.lang || process.env.DEFAULT_LANG, 'joindiscussion');
                    email.body = email.replace('{{class}}',currentClass).body;
                    email.body = email.replace('{{content}}',content).body;
                    sendEmail(reg.user, email.subject, email.body);
                }
                await markSent(course.domain, 'submitfeedback', currentClass+'-'+content, user.id);
            }
        }
        catch (e) {
            sails.log.error(e);
        }
    },

    // join the live class
    liveClassWarning: async (course, klass, hub) => {
        try {
            if (!await hasSent(course.domain, 'liveclasswarning', klass, hub)) {
                let registrations = await Registration.find({
                    course: course.domain,
                    hub_id: hub
                }).populate('user');

                for (let reg of registrations) {
                    let email = await CacheEngine.getEmail(course, reg.lang || process.env.DEFAULT_LANG, 'joinliveclass');
                    sendEmail(reg.user, email.subject, email.body);
                }

                await markSent(course.domain, 'liveclasswarning', klass, hub);
            }
        }
        catch (e) {
            sails.log.error(e);
        }
    },

    // join the live class
    afterLiveClass: async (course, klass, hub) => {
        try {
            if (!await hasSent(course.domain, 'afterliveclass', klass, hub)) {
                let registrations = await Registration.find({
                    course: course.domain,
                    hub_id: hub
                }).populate('user');

                for (let reg of registrations) {
                    let email = await CacheEngine.getEmail(course, reg.lang || process.env.DEFAULT_LANG, 'readdeepdive');
                    sendEmail(reg.user, email.subject, email.body);
                }

                await markSent(course.domain, 'afterliveclass', klass, hub);
            }
        }
        catch (e) {
            sails.log.error(e);
        }
    },

    // the webinar is soon
    webinarSoon: async (course, klass) => {
        try {
            if (!await hasSent(course.domain, 'webinarsoon', klass)) {
                let registrations = await Registration.find({
                    course: course.domain
                }).populate('user');

                for (let reg of registrations) {
                    let email = await CacheEngine.getEmail(course, reg.lang || process.env.DEFAULT_LANG, 'webinarsoon');
                    sendEmail(reg.user, email.subject, email.body);
                }

                await markSent(course.domain, 'webinarsoon', klass);
            }
        }
        catch (e) {
            sails.log.error(e);
        }
    },

    // get ready for next week
    nextWeek: async (course, klass) => {
        try {
            if (!await hasSent(course.domain, 'nextweek', klass)) {
                let registrations = await Registration.find({
                    course: course.domain,
                    class: klass
                }).populate('user');

                for (let reg of registrations) {
                    let email = await CacheEngine.getEmail(course, reg.lang || process.env.DEFAULT_LANG, 'nextweek');
                    sendEmail(reg.user, email.subject, email.body);
                }

                await markSent(course.domain, 'nextweek', klass);
            }
        }
        catch (e) {
            sails.log.error(e);
        }
    },

    // notification of a new peer discussion message
    newPeerMessage: async (req, user, message) => {
        try {
            sails.log.verbose('PeerMessage',{msg:'notification email', message:message});
            let lang = await LangService.lang(req);
            let email = await CacheEngine.getEmail(req.course, lang || process.env.DEFAULT_LANG, 'newfeedback');

            //find all other people in discussion for this submission:
            // let users = await DiscussionMessage.find({
            //     relates_to: message.relates_to
            // }).populate('fromuser');

            // users = _.uniq(_.pluck(users,'fromuser'),'id');

            // for (let user of users) {
            // if (user.id != req.session.passport.user.id) {
            email.body = email.body.replace('{{id}}', message.relates_to.replace('#','%23'));
            email.body = email.body.replace('{{class}}',message.relates_to.class);
            email.body = email.body.replace('{{content}}',message.relates_to.content);
            sendEmail(user, email.subject, email.body);
            // }
            // }
        }
        catch (e) {
            sails.log.error(e);
        }
    }
}
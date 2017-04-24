let helper = require('sendgrid').mail;
let sg = require('sendgrid')(process.env.SENDGRID_KEY);
let fs = require('fs-promise');

let sendEmail = async function(user, subject, content){

    var from_email = new helper.Email(process.env.FROM_EMAIL,process.env.FROM_NAME);
    var to_email = new helper.Email(user.email);
    var subject = subject;

    let template = await fs.readFile(__dirname + '/../../views/email.html');
    let realcontent = template.toString().replace('{{body}}',content)

    var content = new helper.Content('text/html', realcontent);
    var mail = new helper.Mail(from_email, subject, to_email, content);

    var request = sg.emptyRequest({
        method: 'POST',
        path: '/v3/mail/send',
        body: mail.toJSON(),
    });

    sg.API(request, function(error, response) {
        if (error)
            sails.log.error(error);
        else
            sails.log.verbose('Mail Sent',response);
    });
};

let hasSent = async function(course, ...ident)
{
    // console.log(course + "::" + ident.join('-'));
    let result = await Notifications.findOne({
        course:course,
        ident:ident.join('-')
    });
    if (result)
        return true;
    else
        return false;
}

let markSent = async function(course,...ident)
{
    return new Promise((resolve, reject) => {
        Notifications.create({
            course: course,
            ident: ident.join('-')
        }).exec((err)=>{
            if (err)
                reject(err);
            else
                resolve();
        });
    });
}

module.exports = {
    
    //welcome to the course
    signup: async (req,user)=>{
        try
        {
            sails.log.verbose('Sending signup notification',user.id);
            let lang = await LangService.lang(req);
            let email = await CacheEngine.getEmail(req.course, lang,'intro');
            email.body = email.body.replace('{{user}}',user.name);
            email.body = email.body.replace('{{date}}',new Date().toString());
            await sendEmail(user,email.subject,email.body);
        }
        catch (e){
            sails.log.error(e);
        }
    },

    // course starting (1 week before)
    weekBefore: async (course)=>{
         if (!await hasSent(course.domain, 'weekbefore'))
         {
            sails.log.verbose('Sending weekbefore notification', course.domain);

            let registrations = await Registration.find({
                course: course.domain
            }).populate('user');
            
            for (let reg of registrations)
            {
                let email = await CacheEngine.getEmail(course, reg.lang,'coursestarting_week');
                email.body = email.body.replace('{{user}}',reg.user.name);
                email.body = email.body.replace('{{date}}',new Date().toString());
                sendEmail(reg.user,email.subject,email.body);
            }
            await markSent(course.domain,'weekbefore');
        }
    },
    
    // course starting (day before)
    dayBefore: async (course)=>{
        if (!await hasSent(course.domain, 'daybefore'))
        {
            sails.log.verbose('Sending daybefore notification', course.domain);

            let registrations = await Registration.find({
                course: course.domain
            }).populate('user');
            
            for (let reg of registrations)
            {
                let email = await CacheEngine.getEmail(course, reg.lang,'coursestarting_day');
                email.body = email.body.replace('{{user}}',reg.user.name);
                email.body = email.body.replace('{{date}}',new Date().toString());
                sendEmail(reg.user,email.subject,email.body);
            }
            await markSent(course.domain,'daybefore');
        }
    },

    // Final questionaire push
    courseClose: async (course)=>{
        if (!await hasSent(course.domain, 'courseclose'))
        {
            sails.log.verbose('Sending courseclose notification', course.domain);

            let registrations = await Registration.find({
                course: course.domain
            }).populate('user');
            
            for (let reg of registrations)
            {
                let email = await CacheEngine.getEmail(course, reg.lang,'courseclose');
                email.body = email.body.replace('{{user}}',reg.user.name);
                email.body = email.body.replace('{{date}}',new Date().toString());
                sendEmail(reg.user,email.subject,email.body);
            }
            await markSent(course.domain,'courseclose');            
        }
    },

    // read pre-content
    readPreContent: async (course,klass)=>{
        //
        if (!await hasSent(course.domain, 'precontent',klass))
        {
            sails.log.verbose('Sending precontent notification', course.domain, klass);

            let registrations = await Registration.find({
                course: course.domain
            }).populate('user');
            
            for (let reg of registrations)
            {
                let email = await CacheEngine.getEmail(course, reg.lang,'readprecontent');
                email.body = email.body.replace('{{user}}',reg.user.name);
                email.body = email.body.replace('{{date}}',new Date().toString());
                sendEmail(reg.user,email.subject,email.body);
            }

            await markSent(course.domain,'precontent',klass);            
        }
    },

    // post your submission e.g. 4c
    submitWork: async (course, currentClass, user) =>{
        if (!await hasSent(course.domain, 'submitwork',currentClass,user.id))
        {
            sails.log.verbose('Sending submitwork notification', course.domain, klass);
            
            let registration = await Registration.findOne({
                course: course.domain,
                user: user.id
            }).populate('user');

            let email = await CacheEngine.getEmail(course, reg.lang,'postsubmission');
            email.body = email.body.replace('{{user}}',reg.user.name);
            email.body = email.body.replace('{{date}}',new Date().toString());
            sendEmail(reg.user,email.subject,email.body);

            await markSent(course.domain,'submitwork',currentClass,user.id);         
        }
    },

    // you should submit feedback
    submitFeedback: async (course, currentClass, user) =>{
        if (!await hasSent(course.domain, 'submitfeedback',currentClass,user.id))
        {
            let registration = await Registration.findOne({
                course: course.domain,
                user: user.id
            }).populate('user');

            let email = await CacheEngine.getEmail(course, reg.lang,'joindiscussion');
            email.body = email.body.replace('{{user}}',reg.user.name);
            email.body = email.body.replace('{{date}}',new Date().toString());
            sendEmail(reg.user,email.subject,email.body);
            
            await markSent(course.domain,'submitfeedback',currentClass,user.id);         
        }
    },

    // join the live class
    liveClassWarning: async (course, klass, hub)=>
    {
        if (!await hasSent(course.domain, 'liveclasswarning',klass,hub))
        {
            let registrations = await Registration.find({
                course: course.domain,
                hub_id: hub
            }).populate('user');
            
            for (let reg of registrations)
            {
                let email = await CacheEngine.getEmail(course, reg.lang,'joinliveclass');
                email.body = email.body.replace('{{user}}',reg.user.name);
                email.body = email.body.replace('{{date}}',new Date().toString());
                sendEmail(reg.user,email.subject,email.body);
            }

            await markSent(course.domain,'liveclasswarning',klass,hub);            
        }
    },

    // join the live class
    afterLiveClass: async (course, klass, hub)=>
    {
        if (!await hasSent(course.domain, 'afterliveclass',klass,hub))
        {
            let registrations = await Registration.find({
                course: course.domain,
                hub_id: hub
            }).populate('user');
            
            for (let reg of registrations)
            {
                let email = await CacheEngine.getEmail(course, reg.lang,'readdeepdive');
                email.body = email.body.replace('{{user}}',reg.user.name);
                email.body = email.body.replace('{{date}}',new Date().toString());
                sendEmail(reg.user,email.subject,email.body);
            }

            await markSent(course.domain,'afterliveclass',klass,hub);            
        }
    },

    // the webinar is soon
    webinarSoon: async (course, klass)=>
    {
        if (!await hasSent(course.domain, 'webinarsoon',klass))
        {
            let registrations = await Registration.find({
                course: course.domain
            }).populate('user');
            
            for (let reg of registrations)
            {
                let email = await CacheEngine.getEmail(course, reg.lang,'webinarsoon');
                email.body = email.body.replace('{{user}}',reg.user.name);
                email.body = email.body.replace('{{date}}',new Date().toString());
                sendEmail(reg.user,email.subject,email.body);
            }

            await markSent(course.domain,'webinarsoon',klass);            
        }
    },

    // get ready for next week
    nextWeek: async (course, klass)=>
    {
        if (!await hasSent(course.domain, 'nextweek',klass))
        {
            let registrations = await Registration.find({
                course: course.domain,
                class: klass
            }).populate('user');
            
            for (let reg of registrations)
            {
                let email = await CacheEngine.getEmail(course, reg.lang,'nextweek');
                email.body = email.body.replace('{{user}}',reg.user.name);
                email.body = email.body.replace('{{date}}',new Date().toString());
                sendEmail(reg.user,email.subject,email.body);
            }

            await markSent(course.domain,'nextweek',klass);            
        }
    },

    // notification of a new peer discussion message
    newPeerMessage: async (message)=>{
        try
        {
            sails.log.verbose('Sending offline notification about new peer message',message);
            let lang = await LangService.lang(req);
            let email = await CacheEngine.getEmail(req.course, lang,'newfeedback');
            email.body = email.body.replace('{{user}}',user.name);
            email.body = email.body.replace('{{date}}',new Date().toString());
            await sendEmail(user,email.subject,email.body);
        }
        catch (e){
            sails.log.error(e);
        }
    }
}
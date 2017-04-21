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
    let result = await Notifications.findOne({
        course:course,
        ident:ident
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
            ident: ident
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
        if (!await hasSent(course, 'daybefore'))
        {

            await markSent(course,'daybefore');            
        }
    },

    // Final questionaire push
    courseClose: async (course)=>{
        if (!await hasSent(course, 'courseclose'))
        {

            await markSent(course,'courseclose');            
        }
    },

    // read pre-content
    readPreContent: async (course,klass)=>{
        //
        if (!await hasSent(course, 'courseclose',klass))
        {

            await markSent(course,'courseclose',klass);            
        }
    },

    // post your submission e.g. 4c
    submitWork: async (course, currentClass, user) =>{
        if (!await hasSent(course, 'submitwork',currentClass,user.id))
        {

            await markSent(course,'submitwork',currentClass,user.id);         
        }
    },

    // you should submit feedback
    submitFeedback: async (course, currentClass, user) =>{
        if (!await hasSent(course, 'submitfeedback',currentClass,user.id))
        {

            await markSent(course,'submitfeedback',currentClass,user.id);         
        }
    },

    // join the live class
    liveClassWarning: async (course, klass, hub)=>
    {
        if (!await hasSent(course, 'liveclasswarning',klass,hub))
        {

            await markSent(course,'liveclasswarning',klass,hub);            
        }
    },

    // join the live class
    afterLiveClass: async (course, klass, hub)=>
    {
        if (!await hasSent(course, 'afterliveclass',klass,hub))
        {

            await markSent(course,'afterliveclass',klass,hub);            
        }
    },

    // the webinar is soon
    webinarSoon: async (course, klass)=>
    {
        if (!await hasSent(course, 'webinarsoon',klass))
        {

            await markSent(course,'webinarsoon',klass);            
        }
    },

    // get ready for next week
    nextWeek: async (course, klass)=>
    {
        if (!await hasSent(course, 'nextweek',klass))
        {

            await markSent(course,'nextweek',klass);            
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
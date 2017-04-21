let helper = require('sendgrid').mail;
var sg = require('sendgrid')(process.env.SENDGRID_KEY);

let sendEmail = function(user, subject, content){

    var from_email = new helper.Email(process.env.FROM_EMAIL);
    var to_email = new helper.Email(user.email);
    var subject = subject;
    var content = new helper.Content('text/plain', content);
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

//TODO: i18n email content
//TODO: html email content (based on markdown)

module.exports = {
    
    //welcome to the course
    signup: async (req,user)=>{

        try
        {
            sails.log.verbose('Sending signup notification',user);
            
            let email = await CacheEngine.getEmail(req,'intro');
            email.body.replace('{{user}}',user.name);
            email.body.replace('{{date}}',new Date().toString());

            sendEmail(user,email.titlesubject,email.body);
        }
        catch (e){
            sails.log.error(e);
        }
    },

    //TODO: notifications

    // course starting (1 week before)
    
    // course starting (day before)

    // EACH WEEK

        // read pre-content

        // post your submission e.g. 4c

        // join a discussion
            // - you have new messages
            // - you should submit more feedback

        // join the live class

        // read the deep-dive

        // the webinar is soon

        // get ready for next week

    // Final questionaire push

    // notification of a new peer discussion message
    newPeerMessage: (message)=>{
        sails.log.verbose('Sending offline notification about new peer message',message);
    }
}
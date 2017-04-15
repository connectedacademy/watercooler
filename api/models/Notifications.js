module.exports = {

    orientdbClass : 'document',

    attributes:{
        user:{
            model: 'User'
        },
        content: 'json', //content of notification
        notification: 'string', // type of notification i.e. before_content_push
        notification_type: 'string', //i.e. email, twitter, sms, push
        notification_ident: 'string', //i.e. week1, week2
        time_sent: 'datetime'
    }
}
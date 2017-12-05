module.exports = {
    orientdbClass : 'document',

    attributes:
    {
        user:{
            model:'User'
        },
        verified: 'boolean',
        original:'string',
        cachedat:'datetime',
        course: {
            type:'string',
            index:true
        },
        class: {
            type:'string',
            index: true
        },
        content: {
            type:'string',
            index: true
        },
        html:'text',
        thumbnail:'string',
        discussion:{
            collection:'DiscussionMessage',
            via: 'relates_to'
        },
        moderation: 'array',
        moderationstate: {
            type: 'string',
            enum: ['default','pending', 'approved', 'denied']
        },
        toJSON :function()
        {
            let obj = this.toObject();
            delete obj['@type'];
            delete obj['@class'];
            delete obj['@version'];
            return obj;
        }
    }
}
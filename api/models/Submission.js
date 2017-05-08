module.exports = {
    orientdbClass : 'document',

    attributes:
    {
        user:{
            model:'User'
        },
        url: 'string',
        parsedfrom: 'string',
        cached: 'boolean',
        original:'string',
        cachedat:'datetime',
        course: 'string',
        class: 'string',
        content: 'string',
        html:'text',
        discussion:{
            collection:'DiscussionMessage',
            via: 'relates_to'
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
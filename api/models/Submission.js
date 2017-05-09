module.exports = {
    orientdbClass : 'document',

    attributes:
    {
        user:{
            model:'User'
        },
        url: 'string',
        cached: 'boolean',
        original:'string',
        cachedat:'datetime',
        course: 'string',
        class: 'string',
        content: 'string',
        html:'text',
        thumbnail:'string',
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
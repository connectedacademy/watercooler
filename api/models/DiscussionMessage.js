module.exports = {
  orientdbClass : 'document',

  attributes: {
    message: 'text',
    readAt: 'array',
    relates_to: 
    {
      model: 'Submission' //content it relates to
    },
    fromuser:
    {
      model: 'User',
      index: true
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
};


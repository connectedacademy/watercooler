module.exports = {
  orientdbClass : 'document',

  attributes: {
    message: 'text',
    readAt: 'json',
    relates_to: 
    {
      model: 'Submission' //content it relates to
    },
    fromuser:
    {
      model: 'User'
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


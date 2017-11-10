module.exports = {
  orientdbClass : 'document',

  attributes: {
    course: 'string',
    user:
    {
        model: 'User'
    },
    question_id: 'string',
    class: 'string',
    content: 'string',
    answer: 'string',

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

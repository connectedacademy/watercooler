module.exports = {
  attributes: {
    course: 'string',
    user:
    {
        model: 'User'
    },
    question_id: 'integer',
    class: 'integer',
    content_index: 'integer',
    answer: 'string'
  }
};

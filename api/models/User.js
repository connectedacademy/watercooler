module.exports = {

  attributes: {
    account_number:'string',
    account: 'string',
    service: 'string',
    _raw: 'json',
    name: 'string',
    lang: 'string',
    credentials: 'json'
  },

  toJSON : (obj)=>
  {
    delete obj.credentials;
    return obj;
  }
};


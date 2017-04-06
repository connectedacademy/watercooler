module.exports = {

  attributes: {
    account_number:'string',
    account: 'string',
    service: 'string',
    _raw: 'json',
    name: 'string',
    lang: 'string',
    credentials: 'json',
    hub_id: 'string'
  },

  toJSON : (obj)=>
  {
    delete obj.credentials;
    return obj;
  }
};


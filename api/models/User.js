module.exports = {
  
  orientdbClass : 'V',

  attributes: {
    account_number:'string',
    account: 'string',
    service: 'string',
    _raw: 'json',
    name: 'string',
    lang: 'string',
    credentials: 'json',
    profile: 'string',
    link: 'string',
    registrations:
    {
      collection: 'Registration',
      via:'user',
      dominant:true
    },

    toJSON :function()
    {
      let obj = this.toObject();
      delete obj.credentials;
      delete obj._raw;
      delete obj['@type'];
      delete obj['@class'];
      delete obj['@version'];
      return obj;
    }
  },

 
};


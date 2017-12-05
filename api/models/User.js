module.exports = {
  
  orientdbClass : 'V',
  joinTableNames: {
    admin: 'isadmin'
  },

  attributes: {
    account_number:'string',
    account: 'string',
    service: 'string',
    _raw: 'json',
    name: 'string',
    credentials: 'json',
    account_credentials:'json',
    profile: 'string',
    link: 'string',
    email: 'string',
    registrations:
    {
      collection: 'Registration',
      via:'user',
      dominant:true
    },
    owner:
    {
      model: 'User'
    },
    submissions:
    {
      collection: 'Submission',
      via: 'user'
    },
    admin:'array',

    toJSON :function()
    {
      let obj = this.toObject();
      delete obj.credentials;
      delete obj.account_credentials;
      delete obj._raw;
      delete obj['@type'];
      delete obj['@class'];
      delete obj['@version'];
      return obj;
    }
  },

 
};


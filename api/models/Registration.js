module.exports = {
    
  orientdbClass : 'document',
  
  attributes: {
    course: "string",
    hub_id: "string",
    region: "string",
    age: "string",
    lang: "string",
    consent:'boolean',
    user:
    {
      model: 'User'
    },
    registration_info:'json',
    
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


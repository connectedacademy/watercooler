module.exports = {
    
  orientdbClass : 'document',
  
  attributes: {
    course: "string",
    hub_id: "string",
    region: "string",
    age: "string",
    user:
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


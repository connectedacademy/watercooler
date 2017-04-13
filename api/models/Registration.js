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
    }
  }
};


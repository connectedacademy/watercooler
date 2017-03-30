const osprey = require('osprey');
const join = require('path').join;
const path = join(__dirname, '..','..','..','spec', 'watercooler.raml')

module.exports = function (sails){

  return {
    initialize: async function(cb) {
      try
      {
        let middleware = await osprey.loadFile(path);
        sails.app.use(middleware)
        cb();
      }
      catch (e) { 
         cb();
        //  cb(e.message);
      };
    }
  }
};
let master_config = process.env.MASTER_REPO + 'config/courses.yml'
let URL = require('url')

module.exports = {

  verifyDomain: async (req) => {
    
    // Parse domain
    let url = URL.parse(req.get('referer') || req.get('origin'))
    
    let domain = url.hostname

    let whitelist = await DomainControl.getWhitelist()

    sails.log.verbose('whitelist:')
    sails.log.verbose(whitelist)

    let isvalid = false

    _.each(whitelist.courses,(entry) => {
      // if domain is in whitelist, continue, if not, fail
      if (entry.domain === domain) {
        isvalid = entry
      }
    })

    sails.log.verbose('isvalid:')
    sails.log.verbose(isvalid)

    if (domain == 'localhost' && process.env.DEBUG_MODE == 'true') {
      sails.log.verbose('Returning first course in whitelist')
      return whitelist.courses[_.first(Object.keys(whitelist.courses))]
    } else {
      sails.log.verbose('Returning found course:')
      sails.log.verbose(isvalid)
      return isvalid
    }
  },

  getWhitelist: async () => {
    let whitelist = await CacheEngine.getYaml('connectedacademy.io', master_config)
    return whitelist
  }
}
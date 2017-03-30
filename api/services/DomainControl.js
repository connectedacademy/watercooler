let master_config = process.env.MASTER_REPO + 'config/courses.yml';
let yaml = require('js-yaml');

module.exports = {

    verifyDomain: async (req,res)=>{
        //parse domain
        let domain = req.get('referer');
        
        //lookup (cached) whitelist
        let whitelist_raw = await CacheEngine.get(master_config);
        //load whitelist
        let whitelist = await yaml.safeLoad(whitelist_raw);

        let isvalid = false
        _.each(whitelist.courses,(entry)=>{
            //if domain is in whitelist, continue, if not, fail 
            if (entry.domain === domain)
                isvalid = entry;
        });

        if (domain == 'localhost' && process.env.DEBUG)
            return _.first(whitelist);
        else
            return isvalid;
    }
}
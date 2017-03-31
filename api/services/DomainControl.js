let master_config = process.env.MASTER_REPO + 'config/courses.yml';
let yaml = require('js-yaml');
let URL = require('url');

module.exports = {

    verifyDomain: async (req,res)=>{
        //parse domain
        let url = URL.parse(req.get('referer'));
        let domain = url.hostname;
        
        let whitelist = await DomainControl.getWhitelist(req,res);

        let isvalid = false
        _.each(whitelist.courses,(entry)=>{
            //if domain is in whitelist, continue, if not, fail 
            if (entry.domain === domain)
                isvalid = entry;
        });

        if (domain == 'localhost' && process.env.DEBUG)
        {
            return whitelist.courses[_.first(Object.keys(whitelist.courses))];
        }
        else
        {
            return isvalid;
        }
    },

    getWhitelist: async (req,res)=>{
        
        let whitelist_raw = await CacheEngine.get(master_config);
        //load whitelist
        return whitelist = await yaml.safeLoad(whitelist_raw);
    }

}
let master_config = process.env.MASTER_REPO + 'config/courses.yml';
let URL = require('url');

module.exports = {

    verifyDomain: async (req,res)=>{
        //parse domain
        let url = URL.parse(req.get('referer') || req.get('origin'));
        let domain = url.hostname;
        
        let whitelist = await DomainControl.getWhitelist(req,res);

        let isvalid = false
        _.each(whitelist.courses,(entry)=>{
            //if domain is in whitelist, continue, if not, fail 
            if (entry.domain === domain)
                isvalid = entry;
        });

        if (domain == 'localhost' && process.env.DEBUG_MODE=='true')
        {
            return whitelist.courses[_.first(Object.keys(whitelist.courses))];
        }
        else
        {
            return isvalid;
        }
    },

    getWhitelist: async ()=>{
        
        let whitelist = await CacheEngine.getYaml(master_config);
        return whitelist;
    }

}
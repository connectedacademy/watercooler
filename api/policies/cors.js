let URL = require('url');

module.exports = async function(req,res,next)
{
    //apply origin if the referrer matches the whitelist:
    try
    {
        let url = URL.parse(req.get('origin'));
        sails.log.verbose('Verifying CORS',req.url, url.hostname);

        let whiteList = await DomainControl.getWhitelist(req,res);

        // let domain = url.host;
        //set allowed origin
        if (_.find(whiteList.courses,(w)=>{
            return w.domain == url.hostname;
        }) || url.hostname == 'localhost'){
            // console.log(url);
            sails.log.verbose('CORS Allowed',req.url, url.hostname);                    
            res.header("Access-Control-Allow-Origin", url.protocol + '//' + url.host);
            return next();
        }
        else
        {
            sails.log.verbose('CORS forbidden',req.url, url.hostname);        
            return res.forbidden();
        }
    }
    catch (e)
    {
        //not a cors request
        return next();
    }
}
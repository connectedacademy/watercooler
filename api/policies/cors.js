let URL = require('url');

module.exports = async function(req,res,next)
{
    //apply origin if the referrer matches the whitelist:
    try
    {
        let url = URL.parse(req.get('origin'));
        sails.log.silly('Verifying CORS',req.url, url.hostname);

        let whiteList = await DomainControl.getWhitelist(req,res);

        // let domain = url.host;
        //set allowed origin
        if (_.find(whiteList.courses,(w)=>{ return w.domain == url.hostname; }) || url.hostname == 'localhost'){
            // console.log(url);
            sails.log.silly('CORS Allowed',req.url, url.hostname);                    
            res.header("Access-Control-Allow-Origin", url.protocol + '//' + url.host);
            res.header("Access-Control-Allow-Headers","Content-Type, elevator-version");
            res.header("Access-Control-Allow-Credentials", "true");
            if (req.method == 'OPTIONS')
                return res.end();
            else
                return next();
        }
        else
        {
            if (process.env.DEBUG_MODE==="true")
            {
                sails.log.silly('CORS in DEBUG allowed for blank origin');
                res.header("Access-Control-Allow-Origin", '*');
                res.header("Access-Control-Allow-Headers","Content-Type, elevator-version");
                res.header("Access-Control-Allow-Credentials", "true");
                if (req.method == 'OPTIONS')
                    return res.end();
                else
                    return next();
            }
            else
            {
                sails.log.silly('CORS forbidden',req.url, url.hostname);        
                return res.forbidden();
            }
        }
    }
    catch (e)
    {
        //not a cors request
        return next();
    }
}
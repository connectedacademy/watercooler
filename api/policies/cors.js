let URL = require('url');

module.exports = async function(req,res,next)
{
    //apply origin if the referrer matches the whitelist:
    let whiteList = await DomainControl.getWhitelist(req,res);
    let url = URL.parse(req.get('origin'));

    // let domain = url.host;
    //set allowed origin
    if (url && _.find(whiteList.courses,(w)=>{
        return w.domain == url.hostname;
    }) || url.hostname == 'localhost'){
        console.log(url);
        res.header("Access-Control-Allow-Origin", url.protocol + '//' + url.host);
        return next();
    }
    else
    {
        return res.forbidden();
    }
}
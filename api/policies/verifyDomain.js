let URL = require('url');

module.exports = async (req,res,next) =>{

    try
    {
        sails.log.silly('Verifying domain',req.url, URL.parse(req.get('referer') || req.get('origin')).hostname);
        var verified = await DomainControl.verifyDomain(req,res);
        if (verified)
        {
            req.course = verified;
            next();
        }
        else
        {
            res.forbidden({
                err:'INVALID_DOMAIN',
                msg: req.get('referer') + ' is not a valid Connected Academy course.'
            });
        }
    }
    catch (e)
    {
        console.log(e);
        sails.log.silly('Failed to verify domain',req.url);
        return res.forbidden({
            err:'INVALID_DOMAIN',
            msg:'No valid Origin or Referer header were provided'
        });
    }
}
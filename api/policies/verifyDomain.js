let URL = require('url');

module.exports = async (req,res,next) =>{

    try
    {
        sails.log.verbose('Verifying domain',req.url, URL.parse(req.get('referer')).hostname);
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
        sails.log.verbose('Failed to verify domain',req.url);        
        return res.serverError(e);
    }
}
let URL = require('url');

module.exports = async (req,res,next) =>{
    sails.log.verbose('Verifying domain',req.url, URL.parse(req.get('referer')).hostname);

    try
    {
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
        return res.serverError(e);
    }
}
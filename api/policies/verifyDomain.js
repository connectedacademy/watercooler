//TODO verify this domain is a whitelisted one

module.exports = async (req,res,next) =>{
    sails.log.verbose('Verifying domain',req.url, req.get('referer'));

    var verified = await DomainControl.verifyDomain(req,res);
    if (verified!==false)
    {
        req.course = verified;
        next();
    }
    else
    {
        res.forbidden({
            err:'INVALID_DOMAIN',
            msg:req.get('referer') + ' is not a valid Connected Academy course.'
        });
    }
}
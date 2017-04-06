module.exports = function(req,res,next)
{
    if (req.session.passport && req.session.passport.user && req.session.passport.user.service == 'twitter')
    {
        sails.log.info("Authenticated as User");
        return next();
    }
    else
    {
        return res.forbidden();
    }
}
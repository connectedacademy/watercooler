module.exports = function(req,res,next)
{
    if (req.session.passport && req.session.passport.user.service == 'github')
    {
        sails.log.info("Authenticated as Admin");
        return next();
    }
    else
    {
        return res.forbidden();
    }
}
module.exports = function(req,res,next)
{
    if (req.session.passport && req.session.passport.user.service == 'twitter')
    {
        return next();
    }
    else
    {
        return res.forbidden();
    }
}
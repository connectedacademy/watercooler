module.exports = function(req,res,next)
{
    // console.log(req.session.passport && req.session.passport.service == 'twitter');
    if (req.session.passport)
    {
        return next();
    }
    else
    {
        return res.forbidden();
    }
}
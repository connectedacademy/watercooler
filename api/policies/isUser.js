module.exports = function(req,res,next)
{
    if (req.session.passport)
    {
        return next();
    }
    else
    {
        return res.forbidden();
    }
}
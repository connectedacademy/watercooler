module.exports = async function(req,res,next)
{
    let isadmin = await AuthCheck.isAdmin(req);
    if (isadmin)
        return next();
    else
        return res.forbidden();
}
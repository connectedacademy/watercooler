module.exports = async function(req,res,next)
{
    console.log(req.course.domain);
    console.log(req.session.passport.user.admin);
    if (req.session && req.session.passport && req.session.passport.user && req.session.passport.user.admin && _.includes(req.session.passport.user.admin, req.course.domain))
        return next();
    else
        return res.forbidden();
}
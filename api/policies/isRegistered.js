module.exports = async function(req,res,next)
{
    //console.log(req.session.passport.user);
    var registration = await Registration.findOne({
        user:req.session.passport.user.id,
        course: req.course.domain
    });
    
    if (registration)
    {
        req.session.passport.user.registration = registration;
        sails.log.info("Confirmed registration as User");
        return next();
    }
    else
    {
        return res.badRequest('You are not registered on this course');
    }
}
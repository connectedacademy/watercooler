module.exports = async function(req,res,next)
{
    if (req.session.passport && req.session.passport.user.service == 'github')
    {
        sails.log.info("Authenticated as Admin");

        //check that this admin can authenticate for this course

        //TODO: check admin authentication for this course:

        let git = req.course.repo;
        // console.log(git);


        return next();
    }
    else
    {
        return res.forbidden();
    }
}
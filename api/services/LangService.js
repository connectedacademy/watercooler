module.exports = {
    lang: async (req) =>
    {
        if (req.session.passport && req.session.passport.user)
        {
            if (!req.session.passport.user.registration)
            {
                let reg = Registration.findOne({
                    user: req.session.passport.user.id,
                    course: req.course.domain
                });
                req.session.passport.user.registration = reg;
            }
            return req.session.passport.user.registration.lang;
        }
        else
            return 'en';
    }
}
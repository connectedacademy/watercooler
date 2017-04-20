module.exports = {
    lang: (req) =>
    {
        if (req.session.passport && req.session.passport.user)
            return req.session.passport.user.lang;
        else
            return 'en';
    }
}
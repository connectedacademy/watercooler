module.exports = function(req, res, next) {
    if (req.wantsJSON)
    {
        return next();
    }
    else
    {
        sails.log.verbose('Not a JSON request',req.uri);
        return res.view('jsononly');
    }
}
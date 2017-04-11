module.exports = function(req, res, next) {
    if (req.wantsJSON)
    {
        return next();
    }
    else
    {
        sails.log.vebose('Not a JSON request');
        return res.view('jsononly');
    }
}
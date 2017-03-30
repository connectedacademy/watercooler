module.exports = function(req, res, next) {
    if (req.wantsJSON)
        return next();
    else
        return res.view('jsononly');
}
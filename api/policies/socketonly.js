module.exports = function(req,res,next)
{
    if (req.isSocket)
    {
        return next();
    }   
    else
    {
        sails.log.verbose('Socket Only',req.url);
        return res.status(426).json({
            err: 'SOCKET_CONNECTION_REQUIRED',
            msg:'A websocket connection is required to use this endpoint'
        })
    }
}
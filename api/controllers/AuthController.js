/**
 * AuthController
 *
 * @description :: Server-side logic for managing Auths
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

module.exports = {

	root: (req,res) =>
    {
        return res.json({
            msg:'Watercooler Running'
        })
    }
};


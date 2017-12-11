const omitDeep = require('omit-deep-lodash');

module.exports = {

    /**
     * @api {post} /v1/moderation/report Report For Moderation
     * @apiDescription Report any item for moderation
     * @apiName moderationreport
     * @apiGroup Moderation
     * @apiVersion  1.0.0
     * @apiPermission domainparse
     * @apiPermission admin
     * 
     * @apiParam  {String} body.item Item ID
     * 
     */
    report: async (req, res) => {

        try {
            //do not let on that it is a valid object:
            let obj = await Submission.query(`SELECT FROM ${req.body.item}`);
            if (obj) {
                let query = `UPDATE ${req.body.item} SET moderationstate="pending" ADD moderation=${JSON.stringify({
                    user: req.session.passport.user.id,
                    date: new Date(),
                    action: 'report'
                })} WHERE moderationstate NOT IN ["denied","approved"]`;

                await Submission.query(query);

                return res.json({
                    msg: 'Thanks for your report'
                });
            }
            else {
                return res.json({
                    msg: 'Thanks for your report'
                });
            }
        }
        catch (e) {
            return res.serverError(e);
        }
    },

    /**
     * @api {post} /v1/moderation/change/:item Change Moderation Status
     * @apiDescription Change status for any item getting moderated
     * @apiName moderationchange
     * @apiGroup Moderation
     * @apiVersion  1.0.0
     * @apiPermission domainparse
     * @apiPermission admin
     * 
     * @apiParam  {String} item Item ID
     * @apiParam  {String} moderationstate One of 'approved','denied'
     * 
     */
    change: async (req, res) => {
        try {
            req.checkBody('moderationstate').isIn(['approved', 'denied']);

            try {
                let result = await req.getValidationResult();
                result.throw();
            }
            catch (e) {
                return res.badRequest(e.mapped());
            }

            let query = `UPDATE ${req.param('item')} SET moderationstate="${req.body.moderationstate}" ADD moderation=${JSON.stringify({
                user: req.session.passport.user.id,
                date: new Date(),
                action: req.body.moderationstate
            })}`;

            await Submission.query(query);

            return res.json({
                msg: 'OK'
            });
        }
        catch (e) {
            return res.serverError(e);
        }
    },

    /**
    * @api {get} /v1/moderation/pending Pending Moderation
    * @apiDescription Get a list of items pending moderation
    * @apiName moderationlist
    * @apiGroup Moderation
    * @apiVersion  1.0.0
    * @apiPermission domainparse
    * @apiPermission admin
    * 
    */
    pending: async (req, res) => {

        let queries = [];

        queries.push(Submission.find({moderationstate:'pending'}));
        queries.push(DiscussionMessage.find({moderationstate:'pending'}));
        queries.push(Message.find({moderationstate:'pending'}));
        
        let pending = await Promise.all(queries);

        let msgs = omitDeep( pending[2],['rid','@version','@type','_raw','@class','credentials','account_credentials','replyto','user_from','out_reply','in','replytolink','admin','user','user2']);

        let output = {
            submissions: pending[0],
            discussion: pending[1],
            messages: msgs
        }

        return res.json(output);
    },

}
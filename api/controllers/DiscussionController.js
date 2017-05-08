module.exports = {

    available: async (req,res)=>{

        //TODO: exclude submissions that I am already involved in.

        //filter submission by current course / class, and not your own, and has cached data. Sort by number of discussion messages ASC

        try
        {
            let query = "SELECT *, list((SELECT FROM discussionmessage WHERE relates_to = $id)).size() as discussion FROM submission LET $id = @rid \
            WHERE cached=true AND course='"+req.course.domain+"' AND class='" + req.param('class') + "' AND content='" + req.param('content')+"' AND user <> '" + req.session.passport.user.id + "'\
            ORDER BY discussion ASC LIMIT 3 FETCHPLAN user:1";
            let data = await Submission.query(query);
            console.log(query);

            return res.json({
                scope:{
                    course: req.course.domain,
                    class: req.param('class'),
                    content: req.param('content')                    
                },
                data: data
            });
        }
        catch (e)
        {
            return res.serverError(e);
        }
    },

    subscribe: async (req,res)=>{
        Submission.watch(req,req.param('submission'));
        return res.ok('Subscribed to new discussion messages for ' + req.param('submission'));
    },

    /**
     * Write new message for a submission
     */
    create: async (req,res)=>{
        
        req.checkBody('text').notEmpty();

        try
        {
            let result = await req.getValidationResult();
            result.throw();
        }
        catch (e)
        {
            return res.badRequest(e.mapped());
        }



        let msg = {
            message: req.param('text'),
            relates_to: req.param('submission'),
            fromuser: req.session.passport.user.id
        };

        try
        {
            DiscussionMessage.create(msg,(err,message)=>{
                if (err)
                {
                    return res.serverError(err);
                }
                else
                {
                    //publish to anyone listening
                    Submission.publishCreate(message, req);
                    //send offline notification (TODO: detect if they are not online)
                    NotificationEngine.newPeerMessage(req, message);
                    return res.json(message);
                }
            })
        }
        catch(e)
        {
            return res.serverError(e);
        }
    },

    read: async (req,res)=>{
        //TODO: validation
        //TODO: mark as read for my as a user:
        try
        {
            await DiscussionMessage.update({id:req.param('message')},{
                readAt: new Date()
            });
            return res.ok('Updated');
        }
        catch (e)
        {
            return res.serverError(e);
        }
    },

    messages: async (req,res)=>{
        //list all messages for this submission
        let data = await DiscussionMessage.find({
            relates_to:req.param('submission')
        })
        .populate('fromuser')
        .sort('createdAt DESC');
        return res.json({
            scope:{
                submission: req.param('submission')
            },
            data:data
        })               
    },

    /**
     * Redirect to the submission url (either my cache or original)
     */
    submission: async (req,res)=>{

        //redirect to the original submission:

        //TODO: validation   
        try
        {
            let data = await Submission.findOne({id:req.param('submission')});
            if (data)
                return res.redirect(data.url);
            else
                return res.notFound();
        }
        catch (e)
        {
            return res.serverError(e);
        }
    },

    list: async (req,res)=>{
        try
        {
         
            //get discussion for submissions I participate in:
            let participated = await Submission.find({
                course: req.course.domain,
                class: req.param('class'),
                content: req.param('content')
            }).populate('user').populate('discussion',{
                fromuser: req.session.passport.user.id
            });

            //get discussions for submissions I own:
            let own = await Submission.find({
                user: req.session.passport.user.id,
                course: req.course.domain,
                class: req.param('class'),
                content: req.param('content')
            })
            .populate('discussion').populate('user');

            _.each(own,(dat)=>{
                dat.unread = _.size(_.filter(dat.discussion,(d)=>{
                    return !d.readAt;
                }));
                dat.messages = _.size(dat.discussion);
            });

            let merge = own.concat(participated);

            let result = _.uniq(merge, function(r){
                return r.id
            });

            return res.json({
                scope:{
                    course: req.course.domain,
                    class: req.param('class'),
                    content: req.param('content')                    
                },
                data: result
            });
        }
        catch (e)
        {
            return res.serverError(e);
        }
    }
}
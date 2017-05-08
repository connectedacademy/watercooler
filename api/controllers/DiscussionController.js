module.exports = {

    available: async (req,res)=>{
        //TODO: algorithm to pick the submission from this filter that needs discussion
        try
        {
            //SELECT relates_to.url as url, relates_to.@rid as id, relates_to.createdAt as createdAt, COUNT(relates_to) AS messages FROM discussionmessage WHERE relates_to.course = "testclass.connectedacademy.io" AND relates_to.class = 1 AND relates_to.schedule = 2 GROUP BY relates_to ORDER BY messages ASC limit 3
            // let data = await DiscussionMessage.query('SELECT relates_to.user.profile as profile, relates_to.user.account as account, relates_to.url as url, relates_to.@rid as id, relates_to.createdAt as createdAt, COUNT(relates_to) AS messages FROM discussionmessage WHERE relates_to.course = "'+req.course.domain+'" AND relates_to.class = "'+req.param('class')+'" AND relates_to.content = '+req.param('content')+' GROUP BY relates_to ORDER BY messages LIMIT 3'); 

            let data = await Submission.find({
                course: req.course.domain,
                class:req.param('class'),
                content:req.param('content'),
                user: req.session.passport.user.id,
                cached: true
            }).limit(3).populate('user');

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

    create: async (req,res)=>{
        //TODO: validation
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
            }).populate('discussion',{
                fromuser: req.session.passport.user.id
            });

            //get discussions for submissions I own:
            let own = await Submission.find({
                user: req.session.passport.user.id,
                course: req.course.domain,
                class: req.param('class'),
                content: req.param('content')
            })
            .populate('discussion');

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
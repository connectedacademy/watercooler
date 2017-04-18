module.exports = {

    available: async (req,res)=>{
        //TODO: algorithm to pick the media from this filter that needs discussion
        try
        {
            //SELECT relates_to.url as url, relates_to.@rid as id, relates_to.createdAt as createdAt, COUNT(relates_to) AS messages FROM discussionmessage WHERE relates_to.course = "testclass.connectedacademy.io" AND relates_to.class = 1 AND relates_to.schedule = 2 GROUP BY relates_to ORDER BY messages ASC limit 3
            let data = await DiscussionMessage.query('SELECT relates_to.user.profile as profile, relates_to.user.account as account, relates_to.url as url, relates_to.@rid as id, relates_to.createdAt as createdAt, COUNT(relates_to) AS messages FROM discussionmessage WHERE relates_to.course = "'+req.course.domain+'" AND relates_to.class = "'+req.param('class')+'" AND relates_to.schedule = '+req.param('schedule')+' GROUP BY relates_to ORDER BY messages LIMIT 3'); 

            return res.json({
                scope:{
                    course: req.course.domain,
                    class: req.param('class'),
                    schedule: req.param('schedule')                    
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
        Submission.watch(req,req.param('media'));
        return res.ok('Subscribed to new discussion messages for ' + req.param('media'));
    },

    create: async (req,res)=>{
        //TODO: validation
        let msg = {
            message: req.param('text'),
            relates_to: req.param('media'),
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
                    NotificationEngine.newPeerMessage(message);
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
        try
        {
            let ok = await DiscussionMessage.update({id:req.param('message')},{
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
        let data = await DiscussionMessage.find({relates_to:req.param('media')}).populate('fromuser').sort('createdAt DESC');
        return res.json({
            scope:{
                media: req.param('media')
            },
            data:data
        })               
    },

    submission: async (req,res)=>{
        //TODO: validation        
        try
        {
            let data = await Submission.findOne({id:req.param('media')});
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
         
            let data = await Submission.find({
                user: req.session.passport.user.id,
                course: req.course.domain,
                class: req.param('class'),
                schedule: req.param('schedule')
            })
            .populate('discussion');

            _.each(data,(dat)=>{
                dat.unread = _.size(_.filter(dat.discussion,(d)=>{
                    return !d.readAt;
                }));
                dat.messages = _.size(dat.discussion);
            })

            return res.json({
                scope:{
                    course: req.course.domain,
                    class: req.param('class'),
                    schedule: req.param('schedule')                    
                },
                data: data
            });
        }
        catch (e)
        {
            return res.serverError(e);
        }
    }
}
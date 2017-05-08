module.exports = {

    available: async (req,res)=>{
        //TODO: exclude submissions that I am already involved in.

        try
        {
            let query = "SELECT *, list((SELECT FROM discussionmessage WHERE relates_to = $id)).size() as discussion FROM submission LET $id = @rid \
            WHERE cached=true AND course='"+req.course.domain+"' AND class='" + req.param('class') + "' AND content='" + req.param('content')+"' AND user <> '" + req.session.passport.user.id + "'\
            ORDER BY discussion ASC LIMIT 3 FETCHPLAN user:1";
            let data = await Submission.query(query);
            // console.log(query);

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

    /**
     * Socket only
     */
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

    /**
     * Read message as embedded list
     */
    read: async (req,res)=>{
        try
        {
            let message = await DiscussionMessage.findOne(req.param('message'));
            if (message)
            {
                if (!message.readAt)
                    message.readAt = [];
                message.readAt.push({
                    user: req.session.passport.user.id,
                    date: (new Date()).toISOString()});
                message.save(function(err){
                    if (err)
                        return res.serverError(err);
                    else
                        return res.ok('Updated');
                });
            }
            else
            {
                return res.notFound();
            }
        }
        catch (e)
        {
            return res.serverError(e);
        }
    },

    /**
     * get messages for submission
     */
    messages: async (req,res)=>{

        //TODO: blank out message if I have not submitted a message to that user's submission which matches the same criteria

        //list all messages for this submission
        let query = "SELECT *, list((SELECT FROM discussionmessage WHERE relates_to = $id)) as discussion FROM "+req.param('submission')+" LET $id = @rid \
            ORDER BY discussion ASC FETCHPLAN user:1 discussion:1 discussion.fromuser:1";
        let data = await Submission.query(query);
        let msg = _.first(data);
        let authors = _.uniq(_.map(msg.discussion,(m)=>{return m.fromuser.id}));
        // console.log(authors);
        //list of authors: for each author, work out if I have submitted a message to one of their submissions:
        // let messages = "SELECT FROM discussionmessage WHERE relatesto.course = 'testclass.connectedacademy.io";
        
        // ALL MESSAGES FROM THESE AUTHORS FOR THIS CRITERIA
            //SELECT FROM discussionmessage WHERE relates_to.user IN [#34:234] AND relates_to.course='testclass.connectedacademy.io' AND relates_to.class='evidence' AND relates_to.content='intro';

        //LIST OF USERS WHO HAVE MADE MESSAGES TO SUBMISSIONS FROM THESE AUTHORS
        query = "SELECT set(fromuser), relates_to.user FROM discussionmessage \
        WHERE relates_to.user IN ["+authors.join(',')+"] \
        AND relates_to.course='"+req.course.domain+"' \
        AND relates_to.class='"+msg.class+"' \
        AND relates_to.content='"+msg.content+"' \
        GROUP BY relates_to.user";
        // console.log(query);
        let messages = await Submission.query(query);
        // console.log(messages);
        //if my id is in the list for each author, then allow the message

        for (let m of msg.discussion)
        {
            let forthisauthor = _.find(messages,{relates_to:m.fromuser.id});
            m.canview = _.includes(forthisauthor,req.session.passport.user.id);
        }

        Submission.removeCircularReferences(msg);

        return res.json(msg);               
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
module.exports = {

    available: async (req,res)=>{
        //TODO: match with submissions in same language (user registration)

        try
        {
            let query = "SELECT *, list((SELECT FROM discussionmessage WHERE relates_to = $id)).size() as discussion FROM submission LET $id = @rid \
            WHERE cached=true AND course='"+req.course.domain+"' AND class='" + req.param('class') + "' AND content='" + req.param('content')+"' AND user <> '" + req.session.passport.user.id + "'\
            AND list((SELECT FROM discussionmessage WHERE relates_to = $id)) CONTAINSALL (fromuser NOT IN ["+req.session.passport.user.id+"])\
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
                    user: req.session.passport.user.id+'',
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
     * Get submission
     */
    submission: async (req,res) =>{
        let submission = await Submission.findOne(req.param('submission')).populate('user');
        if (submission)
            return res.json(submission);
        else
            return res.notFound();
    },

    /**
     * get messages for submission
     */
    messages: async (req,res)=>{

        //list all messages for this submission
        

        // let query = "SELECT FROM discussionmessage WHERE relates_to = "+req.param('submission')+" \
            // ORDER BY discussion.createdAt ASC FETCHPLAN fromuser:1";
        // let data = await DiscussionMessage.find({relates_to:req.param('submission')}).populate('fromuser');
        let submission = await Submission.findOne(req.param('submission'));
        let data = await DiscussionMessage.find({relates_to:req.param('submission')}).populate('fromuser');
        
        let msg = data;
        let authors = _.uniq(_.map(msg,(m)=>{return m.fromuser.id}));
        // console.log(authors);
        //list of authors: for each author, work out if I have submitted a message to one of their submissions:
        // let messages = "SELECT FROM discussionmessage WHERE relatesto.course = 'testclass.connectedacademy.io";
        
        // ALL MESSAGES FROM THESE AUTHORS FOR THIS CRITERIA
            //SELECT FROM discussionmessage WHERE relates_to.user IN [#34:234] AND relates_to.course='testclass.connectedacademy.io' AND relates_to.class='evidence' AND relates_to.content='intro';

        //LIST OF USERS WHO HAVE MADE MESSAGES TO SUBMISSIONS FROM THESE AUTHORS
        let query = "SELECT set(fromuser.asString()) as messagesfrom, relates_to.user as author FROM discussionmessage \
        WHERE relates_to.user IN ["+authors.join(',')+"] \
        AND relates_to.course='"+req.course.domain+"' \
        AND relates_to.class='"+submission.class+"' \
        AND relates_to.content='"+submission.content+"' \
        GROUP BY relates_to.user";
        // console.log(query);
        let author_messages = await Submission.query(query);

        let read = {
            user: req.session.passport.user.id+'',
            date: (new Date()).toISOString()
        };

        //TODO: READ AT - NEEDS FIXING
        let q = "UPDATE discussionmessage ADD readAt = "+JSON.stringify(read) + " WHERE @rid IN ["+_.pluck(data,'id').join(',') + ']';
        // console.log(q);
        await DiscussionMessage.query(q);

        for (let m of msg)
        {
            if (m.fromuser.id == req.session.passport.user.id)
                m.canview = true;
            else
            {
                let forthisauthor = _.find(author_messages,{author:m.fromuser.id});
                if (forthisauthor)
                {
                    m.canview = _.includes(forthisauthor.messagesfrom,req.session.passport.user.id);
                }
                else
                {
                    m.canview = false;
                }
            }

            if (_.find(m.readAt,{user:req.session.passport.user.id+''}))
            {
                m.unread = false;
            }
            else
            {
                m.unread = true;
            }
        }

        Submission.removeCircularReferences(msg);

        return res.json(msg);               
    },

    list: async (req,res)=>{
        try
        {
         
            // get discussion for submissions I participate in:
            
            let query = "SELECT relates_to as submission, list(@this).include('readAt','@rid') as discussion FROM discussionmessage WHERE \
                (fromuser="+req.session.passport.user.id+" or relates_to.user="+req.session.passport.user.id+") \
                AND relates_to.course='"+req.course.domain+"' \
                AND relates_to.class='"+req.param('class')+"' \
                AND relates_to.content='"+req.param('content')+"' \
                GROUP BY relates_to FETCHPLAN submission:2 discussion:1";
            

            let all = await Submission.query(query);
            // let p = Submission.find({
            //     cached:true,
            //     course: req.course.domain,
            //     class: req.param('class'),
            //     content: req.param('content')
            // }).populate('user').populate('discussion',{
            //     fromuser: req.session.passport.user.id
            // });

            //get discussions for submissions I own:
            // let o = Submission.find({
            //     cached:true,
            //     user: req.session.passport.user.id,
            //     course: req.course.domain,
            //     class: req.param('class'),
            //     content: req.param('content')
            // })
            // .populate('discussion').populate('user');

            // let [participated,own] = await Promise.all([p,o]);
            
            // let merge = own.concat(participated);
            // let result = _.uniq(all, function(r){
            //     return r.id
            // });
            
            _.each(all,(dat)=>{
                // console.log(dat.discussion);
                dat.unread = _.size(
                    _.filter(dat.discussion,(d)=>{
                        // console.log(d.readAt);
                        return !_.find(d.readAt,{user:req.session.passport.user.id+''});

                    })
                );
                dat.messages = _.size(dat.discussion);
            });

            all = _.map(all,(dat)=>{
                let tmp = dat.submission;
                tmp.unread = dat.unread;
                tmp.message = dat.messages;
                return dat.submission
            });

            return res.json({
                scope:{
                    course: req.course.domain,
                    class: req.param('class'),
                    content: req.param('content')                    
                },
                data: all
            });
        }
        catch (e)
        {
            return res.serverError(e);
        }
    }
}
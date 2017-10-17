const RSS = require('rss');

module.exports = {

    /**
     * 
     * @api {get} /v1/classroom/mycode/:class My Teacher Code
     * @apiDescription Get the code to give to students if I am a teacher
     * @apiName mycode
     * @apiGroup Classroom
     * @apiVersion  1.0.0
     * @apiPermission domainparse
     * @apiPermission user 
     * 
     * @apiParam  {String} class Class slug
     * 
     */
    mycode: async (req,res) => {

        let course = req.course.domain;
        let klass = req.param('class');

        let lang = await LangService.lang(req);
        let hash = await Classroom.getcode();

        Classroom.findOrCreate({
            course: course,
            class: klass,
            teacher: req.session.passport.user.id
        },
        {
            course: course,
            class: klass,
            teacher: req.session.passport.user.id,
            code: hash
        }).exec((err,result)=>{
            if (err)
                return res.serverError(err);

            //if socket connection -- subscribe to updates:
            if (req.isSocket)
            {
                Classroom.subscribe(req, result.id);
                //req, course, klass, user, language,contentid, classroom
                GossipmillApi.subscribeToClass(req, course, klass, req.session.passport.user, lang, result.code);
            }

            return res.json({
                code: result.code,
                students: _.size(result.students)
            });
        });

    },

    /**
     * 
     * @api {get} /v1/classroom/getclass/:class My Classroom
     * @apiDescription Get status on ths current user in a classroom
     * @apiName getclass
     * @apiGroup Classroom
     * @apiVersion  1.0.0
     * @apiPermission domainparse
     * @apiPermission user
     * 
     * @apiParam  {String} class Class slug
     * @apiParam  {String} content Content slug
     */
    getclass: async (req,res)=>{
        try
        {
            let course = req.course.domain;
            let klass = req.param('class');
            let mystudent = await Classroom.findOne(
                {
                    students:[req.session.passport.user.id],
                    course: course,
                    class: klass
                }
            ).populate('teacher');

            if (mystudent)
            {
                return res.json(_.omit(mystudent,'students'));
            }
            else
            {
                return res.notFound('Not registered in this classroom');
            }
        }
        catch(e)
        {
            return res.serverError(e);
        }
    },

    /**
     * 
     * @api {post} /v1/classroom/inclass Register Attendance
     * @apiDescription Register attendance in this classroom
     * @apiName inclass
     * @apiGroup Classroom
     * @apiVersion  1.0.0
     * @apiPermission domainparse
     * @apiPermission user
     * 
     * @apiParam  {String} code Classroom code provided by the teacher
     */
    inclass: async (req,res)=>{
        try
        {
            let code = req.body.code.toUpperCase();
            let classroom = await Classroom.findOne({
                code:code
            });

            if (!classroom)
                return res.badRequest('Code invalid');

            if (!classroom.students)
                classroom.students = [];
            if (!_.includes(classroom.students,req.session.passport.user.id))
            {
                classroom.students.push(req.session.passport.user.id);

                classroom.save((err)=>{
                    if (err)
                        return res.serverError(err);

                    //publish update via message:
                    let wrapped = {
                        msgtype: 'classroom',
                        msg: req.session.passport.user.id
                    };

                    Classroom.message(classroom.id, wrapped, req);
                    
                    return res.ok('Registered');
                });
            }
            else
            {
                return res.ok('Already registered in this classroom');
            }
        }
        catch(e)
        {
            return res.serverError(e);
        }
    },

    /**
     * 
     * @api {get} /v1/classroom/rss/{code} RSS Feed
     * @apiDescription RSS feed of the relevant content for a particular class to be used by the teacher to generate a (storify) narrative.
     * @apiName rss
     * @apiGroup Classroom
     * @apiVersion  1.0.0
     * 
     * @apiParam  {String} code Classroom code provided by the teacher
     */
    rss: async (req,res)=>{
        try
        {
            let code = req.param('code');
            //console.log(code);
            let classroom = await Classroom.findOne({
                code:code
            }).populate('teacher');

            if (!classroom)
                return res.notFound('No classroom found');
            
            // let users = await User.find({
            //     id: classroom.students
            // });

            // console.log(users);
            req.course = {
                url:'https://' + classroom.course
            };

            let lang = await LangService.lang(req);


            let data = await CacheEngine.getSpec(req,res);
            let klass = _.find(data.classes,{
                slug: classroom.class
            });
            // console.log(klass);
            let content = _.find(klass.content,{
                content_type: 'liveclass'
            });
            // console.log(content);

            let metadata = await CacheEngine.getFrontmatter(req.course.url + '/course/content/' + lang + '/' + klass.dir + '/' + content.url);
            
            // console.log(metadata);

            let feed = new RSS({
                title: 'Connected Academy - ' + metadata.title,
                description: 'Live feed of CA classroom',
                feed_url: 'https://api.connectedacademy.io/v1/classroom/rss/' + code,
                site_url: 'https://'+classroom.course + '/#/course/' + klass.slug,
                language: lang,
                pubDate: new Date().toISOString(),
                ttl: '1',
                custom_namespaces: {
                    'media': 'http://search.yahoo.com/mrss/'
                },
            });

            //if there is an image prompts file:
            if (metadata.images)
            {
                //load the prompts file:
                let images = await CacheEngine.getSubs(req.course.url + '/course/content/' + lang + '/' + klass.dir + '/' + metadata.images);
                let i = 0;
                for (let image of images)
                {
                    feed.item({
                        title:  'Image ' + i,
                        description: '<img src="'+req.course.url + '/course/content/media/medium/' + image.text+'" />',
                        url: req.course.url + '/course/content/media/medium/' + image.text, // link to the item
                        author: 'Connected Academy', // optional - defaults to feed author property 
                        date: new Date().toISOString() // any format that js Date can parse. 
                    });
                    i++;
                }
            }
            
            // latest messages / notes

            let messages = await GossipmillApi.listForUsers(classroom.course, klass.slug, classroom.teacher, content.slug, classroom.students, true);

            // console.log(messages);

            // let items = [];
            getItems(messages.data,feed, klass, content, req.course.url);

            res.type('xml');
            return res.send(feed.xml());
        }
        catch(e)
        {
            return res.serverError(e);
        }
    }
}

function getItems(messages, feed, klass, content, url)
{
    for (let message of messages)
    {
        
        let author = 'Unknown';

        // console.log(message);

        if (message.author && message.author.name)
            author = message.author.name
        // console.log(message.segment);
        feed.item({
            title:  message.text,
            description: 'by @'+author + ' on ' + message.createdAt,
            url: url + '/#/course/' +  klass.slug + '/' + content.slug + '/' + message.segment, // + ((message.segment)? '/' + message.segment:''), // link to the item
            author: '@'+ author, // optional - defaults to feed author property 
            date: message.createdAt // any format that js Date can parse. 
        });
        getItems(message.in_reply,feed, klass, content, url);
    }
}
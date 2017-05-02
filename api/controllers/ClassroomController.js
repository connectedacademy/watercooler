const shortid = require('shortid');

module.exports = {

    mycode: async (req,res) => {

        let course = req.course.domain;
        let klass = req.param('class');
        let content = req.param('content');

        let hash = shortid.generate();

        Classroom.findOrCreate({
            course: course,
            class: klass,
            content: content,
            teacher: req.session.passport.user.id
        },
        {
            course: course,
            class: klass,
            content: content,
            teacher: req.session.passport.user.id,
            code: hash
        }).exec((err,result)=>{
            if (err)
                return res.serverError(err);

            return res.json({
                code: result.code
            });
        });

    },

    users: async (req,res) => {
        //return users who have made messages in this classroom for my code (i.e. I am the teacher)
        let course = req.course.domain;
        let klass = req.param('class');
        let content = req.param('content');

        let classroom = await Classroom.findOne(
            {
                course: course,
                class: klass,
                content: content,
                teacher: req.session.passport.user.id
            }
        );
        
        let users = await User.find({
            id: classroom.students
        });

        if (classroom)
            return res.json(users);
        else
            return res.badRequest('Invalid class/content');
    },

    inclass: async (req,res)=>{
        try
        {
            let code = req.body.code;
            let classroom = await Classroom.findOne({
                code:code
            });

            if (!classroom)
                return res.badRequest('Code invalid');

            if (!classroom.students)
                classroom.students = [];
            classroom.students.push(req.session.passport.user.id);

            classroom.save((err)=>{
                if (err)
                    return res.serverError(err);
                return res.ok('Registered');
            });
        }
        catch(e)
        {
            return res.serverError(e);
        }
    }
}
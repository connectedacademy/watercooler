module.exports = {

    /**
     * 
     * @api {get} /v1/classroom/mycode/:class/:content My Teacher Code
     * @apiDescription Get the code to give to students if I am a teacher
     * @apiName mycode
     * @apiGroup Classroom
     * @apiVersion  1.0.0
     * @apiPermission domainparse
     * @apiPermission user 
     * 
     * @apiParam  {String} class Class slug
     * @apiParam  {String} content Content slug
     * 
     */
    mycode: async (req,res) => {

        let course = req.course.domain;
        let klass = req.param('class');
        let content = req.param('content');

        let hash = await Classroom.getcode();

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

    /**
     * 
     * @api {get} /v1/classroom/users/:class/:content List Students
     * @apiDescription Get a list of students who have registered in this classroom
     * @apiName users
     * @apiGroup Classroom
     * @apiVersion  1.0.0
     * @apiPermission domainparse
     * @apiPermission user
     * 
     * @apiParam  {String} class Class slug
     * @apiParam  {String} content Content slug
     */
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
        
        if (!classroom)
            return res.notFound('No classroom found');
        
        let users = await User.find({
            id: classroom.students
        });

        if (classroom)
            return res.json(users);
        else
            return res.badRequest('Invalid class/content');
    },

    /**
     * 
     * @api {get} /v1/classroom/getclass/:class/:content My Classroom
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
            let content = req.param('content');
            let mystudent = await Classroom.findOne(
                {
                    students:[req.session.passport.user.id],
                    course: course,
                    class: klass,
                    content: content
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
            let code = req.body.code;
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
    }
}
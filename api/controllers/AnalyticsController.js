module.exports = {

    question: async (req,res)=>{
        //TODO: select questions by other parameters, not just random:
        let klass = req.param('class');
        let content = req.param('content');

        let myanswers = await Answer.find({
            user: req.session.passport.user.id,
            course: req.course.domain,
            class: klass,
            content: content
        });
        if (_.size(myanswers)>0)
        {
            return res.json({
                answeredat: _.first(myanswers).createdAt,
                alreadyanswered:true
            })
        }
        else
        {
            let questions = await CacheEngine.getQuestions(req,res);
            //randomly pick a question:
            let question = _.sample(questions.during);
            return res.json(question);
        }
    },

    submit: async (req,res)=>{

        req.checkBody('class').notEmpty();
        req.checkBody('content').notEmpty();
        req.checkBody('answer').notEmpty();
        req.checkBody('question_id').notEmpty();

        try {
            let result = await req.getValidationResult();
            result.throw();
        }
        catch (e) {
            return res.badRequest(e.mapped());
        }
        try
        {
            await Answer.create({
                course: req.course.domain,
                user: req.session.passport.user.id,
                question_id: req.body.question_id,
                class: req.body.class,
                content: req.body.content,
                answer: req.body.answer
            });
            return res.ok('Response received');
        }
        catch (e)
        {
            return res.serverError(e)
        }
    },
 
    answers: async (req,res)=>{
        //get the questions:
        let questions = await CacheEngine.getQuestions(req,res);
        let answers = await Answer.find({course:req.course.domain});
        let results = _.map(questions,(q)=>{
            return {
                question: q,
                answers: _.filter(answers,{question_id:q.id})
            }
        });

        return res.json(results);
    }
}
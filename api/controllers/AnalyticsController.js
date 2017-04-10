module.exports = {

    question: async (req,res)=>{
        //TODO: select questions by other parameters, not just random:
        let class_in_course = req.param('class');
        let content_type_in_class = req.param('content_type');

        let questions = await CacheEngine.getQuestions(req,res);
        let question = _.sample(questions)
        //randomly pick a question:
        return res.json(question);
    },

    response: async (req,res)=>{
        try
        {
            await Answer.create({
                course: req.course.domain,
                user: req.session.passport.user.id,
                question_id: req.body.question_id,
                class: req.body.class,
                content_index: req.body.content_index,
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
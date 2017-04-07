module.exports = {

    question: async (req,res)=>{
        let questions = await CacheEngine.getQuestions(req,res);
        //randomly pick a question:
        return res.json(_.sample(questions));

        // return res.dummyLoad('question.json');
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
        let answers = await Answer.find({course:req.course.domain}).populate('user');
        let results = _.map(questions,(q)=>{
            return {
                question: q,
                answers: _.find(answers,{question_id:q.id})
            }
        });

        return res.json(results);
    }
}
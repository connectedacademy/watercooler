let lodash = require('lodash');

module.exports = {

    /**
     * 
     * @api {get} /v1/auth/postquestions End of Course Questions
     * @apiDescription Get list of questions to ask at the end of the course
     * @apiName postquestions
     * @apiGroup Analytics
     * @apiVersion  1.0.0
     * @apiPermission domainparse
     * @apiPermission user
     * 
     */
    postquestions: async (req,res)=>{
        try
        {
            let questions = await CacheEngine.getQuestions(req,res);

            let myanswers = await Answer.find({
                user: req.session.passport.user.id,
                course: req.course.domain,
                question_id: _.first(questions.post).id
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
                return res.json(questions.post);
            }
        }
        catch (e)
        {
            return res.serverError(e);
        }
    },

    /**
     * 
     * @api {get} /v1/analytics/question/:key Get Question
     * @apiDescription Get a single question relevant to this action
     * @apiName question
     * @apiGroup Analytics
     * @apiVersion  1.0.0
     * @apiPermission domainparse
     * @apiPermission user
     * 
     * @apiParam  {String} key Class slug
     */
    question: async (req,res)=>{
        let key = req.param('key');

        let questions = await CacheEngine.getQuestions(req,res);
        if (questions.during[key])
        {
            let myanswers = await Answer.find({
                user: req.session.passport.user.id,
                course: req.course.domain,
                question_id:_.first(questions.during[key]).id
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
                let question = questions.during[key];
                return res.json(question);
            }
        }
        else
        {
            return res.json([]);
        }
    },

    /**
     * 
     * @api {post} /v1/analytics/answer/response Submit Answer
     * @apiDescription Submit an answer to a question
     * @apiName submitanswer
     * @apiGroup Analytics
     * @apiVersion  1.0.0
     * @apiPermission domainparse
     * @apiPermission user
     * 
     * @apiParam  {String} class Class slug
     * @apiParam  {String} content Content slug
     * @apiParam  {String} question_id ID of the question being answered
     * @apiParam  {String} answer The answer to the question
     * 
     * 
     */
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
 
    /**
     * 
     * @api {post} /v1/analytics/answers List Answers
     * @apiDescription List all answers to all questions
     * @apiName answers
     * @apiGroup Analytics
     * @apiVersion  1.0.0
     * @apiPermission domainparse
     * @apiPermission admin
     * 
     * 
     */
    answers: async (req,res)=>{
        //get the questions:
        let [questions,answers,registrations] = await Promise.all([CacheEngine.getQuestions(req,res), Answer.find({course:req.course.domain}), Registration.find({course:req.course.domain})]);

        
        let allresults = [];

        for (let qtype of questions.registration)
        {
            let results = _.pluck(registrations,'registration_info.answers['+qtype.id+']');

            qtype.answers = results;

            qtype.type = 'registration';
            allresults.push(qtype);
        }

        for (let qtype of questions.post)
        {
            let answ = _.pluck(_.filter(answers,{question_id:qtype.id}),'answer');

            qtype.answers = answ;
            qtype.type = 'post';
            allresults.push(qtype);
        }

        for (let key in questions.during)
        {
            for (let qtype of questions.during[key])
            {
                let answ = _.pluck(_.filter(answers,{question_id:qtype.id}),'answer');
                qtype.answers = answ;
                qtype.type = 'during';
                qtype.subtype = key;
                allresults.push(qtype);
            }
        }

        let allanswers = _.map(allresults,function(q){
            if (q.response_type=='text')
                return _.merge(q,{
                    answers: q.answers
                });

            if (q.response_type=='boolean')
                return _.merge(q,{
                    answers: lodash.countBy(q.answers)
                });

            if (q.response_type=='scale')
            {
                let ints = _.map(q.answers,(o)=>parseInt(o));
                return _.merge(q,{
                    answers:{
                        mean: lodash.mean(ints),
                        min: lodash.min(ints),
                        max: lodash.max(ints)
                    }
                });
            }

            if (q.response_type=='multi')
                return _.merge(q,{
                    answers: lodash.countBy(q.answers)
                });
        });

        return res.json(allanswers);
    },

    /**
     * 
     * @api {post} /v1/analytics/log Log
     * @apiDescription Log anything from client
     * @apiName log
     * @apiGroup Analytics
     * @apiVersion  1.0.0
     * @apiPermission domainparse
     * 
     * 
     */
    log: async function(req,res){

        let user = null;
        if (req.session && req.session.passport && req.session.passport.user)
           user = req.session.passport.user.id;

        sails.log.verbose('ClientLog',{
            url: req.method + ' ' + req.path,
            session: req.session.id,
            elevatorversion: req.headers['elevator-version'],
            referrer: req.get('referer') || req.get('origin'),
            user: user,
            agent: _.pick(req.useragent, _.identity),
            event: req.body
        });

        return res.json({
            msg:'ok'
        });
    }
}
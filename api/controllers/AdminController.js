module.exports = {
    editor: (req,res)=>{
        console.log(req.course);
        let splits = req.course.repo.split('/');
        console.log(process.env.EDITOR_URI + splits[3] + '/' + splits[4]);
        return res.redirect(process.env.EDITOR_URI + '#' + splits[3] + '/' + splits[4]);
    },

    credentials: (req,res)=>{

    },

    content: (req,res)=>{


    },

    users: (req,res)=>{

    }
}
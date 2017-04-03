module.exports = {

    subscribe: (req,res)=>{
        return res.json({
            msg:'Subscribed'
        });
    },

    create: (req,res) => {
        return res.json({
            id: 999
        });
    },

    visualisation: (req,res) => {
        return res.dummyLoad('visulisationpoints.json');
    },

    likes: (req,res) =>{
        return res.json(34);
    },

    list: (req,res)=>{
        return res.dummyLoad('messages.json');
    }
}
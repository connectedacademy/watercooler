module.exports = {

    mycode:(req,res) => {
        return res.dummyLoad('mycode.json');
    },

    users: (req,res) => {
        return res.dummyLoad('users.json');
    }

}
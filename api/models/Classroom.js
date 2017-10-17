const randomstring = require('randomstring');

module.exports = {
    orientdbClass : 'document',

    attributes: {
        code:{
            type:'string',
            unique: true,
            index: true
        },
        class:'string',
        course:'string',
        teacher:
        {
            model: 'User',
            index: true
        },
        students: 'array'
    },

    getcode:async function()
    {
        let allcodes_raw = await Classroom.find({});
        let allcodes = _.pluck(allcodes_raw,'code');
        let found = null;
        while (found==null)
        {
            let newcode = randomstring.generate({
                length:4,
                charset: 'alphabetic',
                capitalization:'uppercase',
                readable:true
            });
            if (!_.includes(allcodes,newcode))
                found = newcode;
        }
        return found;
    }
}
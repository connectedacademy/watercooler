module.exports = {
    orientdbClass : 'document',

    attributes: {
        code:{
            type:'string',
            unique: true
        },
        class:'string',
        course:'string',
        content:'string',
        teacher:
        {
            model: 'User'
        },
        students: 'array'
    }
}
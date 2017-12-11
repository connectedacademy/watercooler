module.exports = {
    schema: false,
    attributes: {
        user: {
            model: 'User'
        },

        toJSON: function () {
            let obj = Message.removeCircularReferences(this).toObject();
            obj.author = obj.user;
            delete obj.user;
            delete obj.rid;
            delete obj.processed;
            delete obj.user_from;
            return obj;
        }
    }
}
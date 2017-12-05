module.exports = {
    schema: false,
    attributes: {
        user: {
            model: 'User'
        },
        toJSON: function () {
            let obj = Message.removeCircularReferences(this).toObject();
            return obj;
        }
    }
}
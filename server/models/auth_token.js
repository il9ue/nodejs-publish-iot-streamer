module.exports = function(db) {


    var user = db.define('users', {
        email: String,
        provider: String,
        uid: String,
        token: String,
        token_secret: String,
        token_expires_at: Date,
        kind: String
    },{
        methods: {},
        validations:{}
    });


    return user;
};

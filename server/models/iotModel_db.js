

var orm = require('orm')
module.exports = function(db) {


    var User = db.define('users', {
        email: String,
        provider: String,
        uid: String,
        token: String,
        token_secret: String,
        token_expires_at: Date,
        kind: String
    },{
        methods: {
            device_by_id: function(dev_id, callback) {
                Device.find({user_id: this.id, id: dev_id}, function(err, devices) {
                    if(devices.length == 1) {
                        callback(null, devices[0]);
                    } else {
                        callback(err, null);
                    }
                });
            }
        },
        validations:{}
    });


    var AuthToken = db.define('auth_tokens', {
        token: String
    }, {
        methods: {},
        validations: {}
    });

    AuthToken.user_from_token = function(token, cb) {
        AuthToken.find({token: token}, function(err, authtokens) {
            if( err || authtokens.length == 0){
                cb(null);
            } else {
                authtokens[0].getUser(function(err, user) {
                    if( err || user == null) {
                        cb(null);
                    } else {
                        cb(user)
                    }
                });
            }
        });
    };

    AuthToken.verify = function( token, cb) {
        AuthToken.find({token: token}, function(err, authtokens) {
            if( err || authtokens.length == 0){
                cb(false);
            } else {
                cb(true);
            }
        });
    };

    AuthToken.hasOne('user', User, {reverse: 'authTokens'})



    var Device = db.define('devices', {
        udid: String,
        status: String,
        title: String
    },{
        methods: {
            getSensor: function(cb) {
                DeviceSensor.get( this.id, cb );
            },
            getSetting: function(cb) {
                DeviceSetting.get( this.id, cb );
            }
        }
    });

    Device.hasOne('user', User, {reverse: 'devices'});


    // export models
    var models = {
        User: User,
        AuthToken: AuthToken,
        Device: Device,
        DeviceSensor: DeviceSensor,
        DeviceSetting: DeviceSetting,
        InstalledApp: InstalledApp
    }
    return models;
};

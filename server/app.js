
/**
 * Module dependencies.
 */

var express = require('express');
var http = require('http');
var path = require('path');
var orm = require("orm");
var app_setting = require('./app_setting');

var restapi = require('./routes/restful');
var app = express();

// all environments
app.set('port', process.env.PORT || 4000);
app.set('views', __dirname + '/views');
app.set('view engine', 'jade');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.methodOverride());

app.use(express.static(path.join(__dirname, 'public')));
app.use(orm.express(app_setting.db_addr, {
    define: function (db, models, next) {
        iotModel_db = require('./models/iotModel_db')(db);
        models.User = iotModel_db.User;
        models.AuthToken = iotModel_db.AuthToken;
        models.Device = iotModel_db.Device;
        next();
    }
}));

// development only
if ('development' == app.get('env')) {
    app.use(express.errorHandler());
}

app.get('/api/v1/mydevices/:id/camera/take', restapi.take_photo);
app.get('/api/v1/mydevices/:id/camera/photo', restapi.get_photo);
app.get('/api/v1/mydevices/:id/camera/photo/image/:filename', restapi.get_photo_image);


http.createServer(app).listen(app.get('port'), function(){
    console.log('Express server listening on port ' + app.get('port'));
});

process.on('uncaughtException', function (err) {
    console.log('Caught exception: ' + err.stack);
});


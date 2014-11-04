var orm = require("orm");
var app_setting = require('./app_setting');

var WebSocketServer = require('websocket').server;
var http = require('http');

var axon = require('axon'),
    wsSocket = axon.socket('rep');

var request = require("request"); // used for media shot

var clientList = {};

// device sensor control Mode
var commandMode = "";
var currentDeviceIndex = 0; // up to only 3 of them
var currentAppIndex = 0; // up to only 4 of them
var newAppIndex = 0; // app to download 

CLIENTS_COUNT = 0;
CLIENTS_MAX_NUM = 10000; // maximum concurrent available device connection
CLIENTS = { };

models = {}
orm.connect(app_setting.db_addr, function(err,db){
    if (err) throw err;
    iotModel_db = require('./models/iotModel_db')(db);
    models.User = iotModel_db.User;
    models.AuthToken = iotModel_db.AuthToken;
    models.Device = iotModel_db.Device;
    models.DeviceSensor = iotModel_db.DeviceSensor;
    models.InstalledApp = iotModel_db.InstalledApp;
});

// communication with render client..
// ipc message between mainServer & websocketServer..

var server = http.createServer(function(request, response) {
    console.log((new Date()) + ' Received request for ' + request.url);
    response.writeHead(404);
    response.end();
});

server.listen(5000, function() {
    console.log((new Date()) + ' Server is listening on port 8080');
});

wsServer = new WebSocketServer({
    httpServer: server,
    autoAcceptConnections: false
});


function originIsAllowed(origin) {
  // put logic here to detect whether the specified origin is allowed.
  return true;
}

function setCommandMode(mode) {
    commandMode = mode;
    setInterval(function() {
        console.log("switching mode from server..!");
    }, 3000);
}

wsServer.on('request', function(request) {
    if (!originIsAllowed(request.origin)) {
      request.reject();
      console.log((new Date()) + ' Connection from origin ' + request.origin + ' rejected.');
      return;      
    }


    for(var index in acceptProtocol) {
        console.log(acceptProtocol[index]);
    }    

    var connection = request.accept('lumi-protocol', request.origin); // lumi-protocol only, this logic could be expanded by each device..

    var acceptProtocol = [];
    models.Device.find({udid: request.origin}, function(err, devices){
        if(err != null) {
            //error handling
            request.reject();
            console.log((new Date()) + ' Connection from origin ' + request.origin + ' rejected.');
            return;      
        }

        device = devices[0];
        acceptProtocol.push(devices[0].id);

        CLIENTS[++CLIENTS_COUNT] = connection;
        connection.id = acceptProtocol[0];

        for(var i in CLIENTS) {

            if (i < CLIENTS_MAX_NUM) {
                sendPingSocket(CLIENTS[i], ("Welcome client " + i), i);
            } else {
                console.log((new Date()) + ' Connection from origin ' + request.origin + ' rejected.');
                request.reject();
                return;
            }
        }
    });
    console.log((new Date()) + ' Connection accepted.');
    
    // application port
    wsSocket.connect(8282);
    wsSocket.on('message', function(task, deviceID, appID, url, reply) {
        switch(task.toString()) {
     
            case 'GetReady':
            {
                setTimeout(function() {
                    console.log('Running...');
                }, 3000);
                break;
            }
            case 'ReqCameraReady':
            {
                setTimeout(function() {
                    console.log('requesting camera image...');
                }, 1000);

                console.log(deviceID, connection.id)
                if (deviceID == connection.id) {
                    console.log('----> send to take camera');
                    connection.send(JSON.stringify({
                          id: "CAMERA_ONETAKE_READY"
                    }));

                    var io = require('socket.io').listen(5001);
                    var ss = require('socket.io-stream');
                    var path = require('path');
                    var fs = require('fs');

                    io.of('/Lumismart').on('connection', function(socket) {
                        ss(socket).on('profile-image', function(stream, data) {
                            devid = deviceID;
                            filename = app_setting.filepath_for_capturing(devid);
                            stream.pipe(fs.createWriteStream(filename));
                        });
                    });

                }
                break;
            }
            case 'ReqLatestPhoto':
            {
                setTimeout(function() {
                    console.log('requesting camera image...');
                }, 3000);

                if (deviceID == connection.id) {
                    connection.send(JSON.stringify({
                          id: "CAMERA_ONETAKE"
                    }));
                }
                break;
            }
            default:
                break;
            }
    });

    function sendPingSocket(socket, data, currentClient) {

        if (currentClient === connection.id) {
            // send data to current client only, other clients can't see the message.
            // prevents the broadcasting..
            socket.sendUTF(data.toString());
        } else { 
            return;
        }
    }

    connection.on('message', function(message) {
       
        if (message.type === 'utf8') {
            // console.log('Received Binary Message of ' +
            //      message.utf8Data.length + ' bytes : ' + message.utf8Data
            // );

            data = JSON.parse( message.utf8Data );
            var devid = acceptProtocol[0];
            // update sensor data if there is sensor data
            if(data["sensor"]){
                updateSensorData( devid, data["sensor"] );
            }
            if(data["appstatus"]){
                updateAppStatus( devid, data["appstatus"] );
            }
            if(data["twit"]){
                twitMessage( devid, data["twit"]);
            }
        }
        else if (message.type === 'binary') {
            console.log('Received Binary Message of ' +
                message.binaryData.length + ' bytes'
            );
        } else {
            console.log('33 Received Binary Message of ' + 
                message.length + ' bytes'
            );
        }
    });
    connection.on('close', function(reasonCode, description) {
        var devid = acceptProtocol[0];
        updateConnectionStatus( devid, false );

        console.log((new Date()) + ' Peer ' + connection.remoteAddress + ' disconnected.');
        CLIENTS.length = 0;
        CLIENTS = {};
    });
});


// update connection
var updateConnectionStatus = function( devid, is_alive ){
    models.DeviceSensor.find({device_id: devid}, function(err, sensors){
        if( err || sensors.length == 0 ){
            // create new one
            models.DeviceSensor.create([
                {
                    device_id: devid,
                    connected: is_alive,
                    created_at: data.time,
                    updated_at: data.time
                }], function (err, items) {
                    
                });
        } else {
            // update data
            var sensor = sensors[0];
            sensor.connected = is_alive; 
            sensor.updated_at = new Date;
            sensor.save(function(err){
                // completed
            });
        }
    });
};

// update sensor.
//
// update sensor data which is gotten from device

var twitMessage = function( devid, data ) {
    msg = data["msg"];
    if ( ! msg ) return;
    
    console.log(app_setting.twitter_port_url(devid))
    request.post( app_setting.twitter_port_url(devid),
                  { form: { msg: msg} },
                  function (error, response, body) { 
                      console.log('sent twitter to device : ' + devid);
                  });
};

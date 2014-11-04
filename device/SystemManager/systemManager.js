
var util = require('../utility.js');

var WebSocketClient = require('websocket').client;
var wsRouter = require(util.WEBSOCKETCLIENT_PATH+'/websocketRouter.js');
var fs = require('fs');

var Stream = require('stream').Stream;
var client = new WebSocketClient();
var Device = require('../lumismart/device').Device;
var lumidev = new Device;

var sn = "LS1000000"  

function connectionRetry() {
    console.log('[WSClient] connection retry to server ..');
    client.connect('ws://localhost:5000/', 'iot-protocol', sn); // limited protocol access.. 
}

process.on('SIGINT', function() {
    console.log('[SysManager] Got SIGINT.  Press Control-D to exit.');
});

process.on('SIGHUP', function() {
  console.log('Got SIGHUP signal.');
});

process.on('uncaughtException', function (err) {
    console.log('Caught exception: ' + err.stack);
});

client.on('connectFailed', function(error) {
    console.log('[WSClient] Connect Error: ' + error.toString());
    setTimeout(connectionRetry, 5000);
});

var RETRY_TRY_DONE = false;
var TIMEOUT_ID = "";
client.on('connect', function(connection) {

    clearTimeout(TIMEOUT_ID);
    RETRY_TRY_DONE = true;
    console.log('WebSocket client connected');

    wsRouter.setWebSocketInstance(connection);

    connection.on('error', function(error) {
        console.log("Connection Error: " + error.toString());
    });
    connection.on('close', function() {
        console.log('lumi-protocol Connection Closed');

        TIMEOUT_ID = setTimeout(connectionRetry, 5000);  
    });

    connection.on('message', function(message) {
        if (message.type === 'utf8') {
            console.log("Received: '" + message.utf8Data + "'");

            var servObject = JSON.parse(message.utf8Data); // this is for the app launch state only
            if ("id" in servObject) {
                console.log("[DQ]" + servObject.id);
                
                switch (servObject.id)
                {
                    case "CAMERA_ONETAKE":
                        break;
                    case "CAMERA_ONETAKE_READY":
                        requestCameraTake();
                        break;                   
                }   
            } else {
                console.log("[DQ]" + message.utf8Data);
            }
        }
    });

    function requestCameraReady() {
        var readyNow = wsRouter.SetCameraReady();

        if (readyNow) return true;
        else return false;
    }

    function requestCameraTake() {
        wsRouter.CaptureCameraImage();
    }

});

client.connect('ws://lumismart.magice.co:5000/', 'lumi-protocol', sn); // limited protocol access.. production mode

setTimeout(function() {
    console.log('[SysMaganer] Exiting...... ');
    //process.exit(0);
}, 100);

setTimeout(
    function() {
        console.log("[SysManager] Application booting succeeded..");	
    }, 5000
);

// Keep alive
setInterval(
    function() {
        console.log("[SysManager] working....");
    }, 10000
);


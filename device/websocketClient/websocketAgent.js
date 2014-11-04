
var WebSocketClient = require('websocket').client;
var wsRouter = require('./websocketRouter.js');
var fs = require('fs');
var BufferReadStream = require('streamers').BufferReadStream;

var Stream = require('stream').Stream;
var client = new WebSocketClient();


function init() {
client.on('connectFailed', function(error) {
    console.log('Connect Error: ' + error.toString());
});

client.on('connect', function(connection) {
    console.log('WebSocket client connected');
    
    connection.on('error', function(error) {
        console.log("Connection Error: " + error.toString());
    });
    connection.on('close', function() {
        console.log('iot-protocol Connection Closed');
    });
    connection.on('message', function(message) {
        if (message.type === 'utf8') {
            console.log("Received: '" + message.utf8Data + "'");
            
            var iotObject = JSON.parse(message.utf8Data); 
            if ("id" in iotObject) {
                console.log("[DQ]" + iotObject.id);                
            }
        }
    });


    function routeDataCategory(category) {

        if (category == "camera") {
          wsRouter.CaptureCameraImage();
        }
    }

    function sendDummyText() {
        if (connection.connected) {
            var myMessage = "Hola!";
            connection.sendUTF(myMessage.toString());

            connection.sendUTF(JSON.stringify({
              to: "client2",
              data: "foo"
            }));
        }
    }
    sendDummyText();
});


client.connect('ws://localhost:8080/', 'iot-protocol'); // limited protocol access.. 
}

module.exports = init;

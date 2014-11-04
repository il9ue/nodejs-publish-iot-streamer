var util = require('../utility.js');
var fs = require('fs');
var domain = require('domain');

var mediaAppPath = ''; // this path also should be configured before anything starts

console.log("[WSRouter] initiated .. ");

module.exports = function() {

    var domain = require('domain');
    var axon = require('axon'),
        ipcMother = axon.socket('req'),
        ipcChild = axon.socket('rep');

    var ipcStartDate = Date.now(),
        ipcPastDate = ipcStartDate;

    var wsInstance = {};

    function runMediaApplication() {
        // running Media Application is just one time request running.. 
        var dExcept = domain.create(); // exception handling purpose.. 

        var mediaExec = require('child_process').exec,
            childExec;

        dExcept.on('error', function(err) {
            console.log(err);
        });

        dExcept.run(function() {

            childExec = mediaExec('node ../../Dev/lumismart/device/application/mediaStreamer/mediaApp.js', 
                function(error, stdout, stderr) {

                if(stdout) {
                  console.log('[Media] media application executed, and running .. : ' + stdout);
                  return true;
                }

                if(stderr) {
                  console.log('[Media] stderr occurrs .. : ' + stderr);
                  return false;
                }

                if (error) {
                  console.log('[Media] exec error: ' + error);
                  return false;
                }
            });
        });
    }


    function sendMessageToServer(text) {
        if (wsInstance.connected) {
            wsInstance.sendUTF(JSON.stringify(text));
        } else {
            console.log("Web Socket is not connected.")
        }
    }


    return {

        CaptureCameraImage : function() {
            // run media client..
            var dExcept = domain.create(); // exception handling purpose..  

            dExcept.on('error', function(err) {
              console.log(err);
            });

            dExcept.run(function() {
              
              var spawn = require('child_process').spawn,
                  start = spawn('node', [mediaAppPath]);

                start.stdout.on('data', function (data) {
                  console.log('stdout: ' + data);
                
                  var io = require('socket.io-client');
                  var ss = require('socket.io-stream');
                  var socket = io.connect('http://localhost:5001/iotStream');
                  var stream = ss.createStream();

                    console.log("socket.io connected..!!");

                    var imageDir = ''; // need to configure

                    fs.readdir(imageDir, function (err, files) { // '/' denotes the root folder

                    process.on('uncaughtException', function(err) {
                         console.log('Caught Exception : ' + err.stack);
                    });
        
                    files.forEach( function (file) {
                         fs.lstat('/'+file, function(err, stats) {
                            fs.exists(imageDir + file, function (exists) {
                                 console.log("[wsr] found file..");
                                start.kill('SIGHUP'); 

                                var latestFile = imageDir + "/" + file;
                
                                console.log("[wsr] start sending file");
                                ss(socket).emit('profile-image', stream, {
                                    name: latestFile
                                });                        
                                console.log("[wsr] createReadStream");
                                
                                fs.createReadStream(latestFile).pipe(stream)
                                    .on('end', function() {
                                        console.log("socket.io pipe ended");
                                        console.log("[wsr] sent!!");
                                
                                        fs.unlinkSync(latestFile);
                                    }).on('error', function(err) {
                                        console.log("error occurred while pipe image : " + err);
                                    })                                  
                            });      
                         });
                       });
                    });     

                });

                start.stderr.on('data', function (data) {
                  console.log('stderr: ' + data);
                });

                start.on('close', function (code) {
                  console.log('child process exited with code ' + code);
                });

            });
        },

        setWebSocketInstance : function(instance) {
            setWebSocketInstance(instance);
        },

        sendMessageToServer : function(text) {
            sendMessageToServer(text);
        },

        SetCameraReady : function() {
            console.log("[wsRouter] Camera still shot warming up...");
        }


    }
} ();

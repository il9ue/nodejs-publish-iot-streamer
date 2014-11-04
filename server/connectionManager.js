
console.log("[NodeWAS] connectionManager started..!");

module.exports = function() {

  var domain = require('domain');

  var wsNodeServer = require('./websocketManager.js');

  var axon = require('axon'),
      wsSocket = axon.socket('req');

  function isCommunicationOn() {
    var dExcept = domain.create(); // exception handling purpose..  

    dExcept.on('error', function(err) {
      console.log(err);
    });
    dExcept.run(function() {
      wsSocket.send('Knock', function(res) {
        console.log(res);
      })
    });
  }

  function runWebSocketServer() {
    var dExcept = domain.create(); // exception handling purpose..     
    var wsChild = require('child_process'),
        wsSpawn = wsChild.spawn,
        wsFork = wsChild.fork(__dirname + '/websocketManager.js');

    dExcept.on('error', function(err) {
      console.log(err);
    });
    dExcept.run(function() {
      wsFork.on('message', function(msg) {
        console.log('Parent Got New Message : ', msg);
      });  

      wsFork.send({
        initDone : 'good!'
      });

      wsSocket.format('json');
      wsSocket.bind(8282);
      wsSocket.send('GetReady', function(res) {
        console.log(res);
      })
    });
  }
    
  function requestCaptureShotReady(devID) {
    var dExcept = domain.create(); // exception handling purpose..  

    dExcept.on('error', function(err) {
      console.log(err);
    });
    dExcept.run(function() {
      wsSocket.format('json');
      wsSocket.bind(8282);
      wsSocket.send('ReqCameraReady', devID, function(res) {

          console.log('i got it');

      });
    });
  }


  function requestShotTaken(devID) {
    var dExcept = domain.create(); // exception handling purpose..  

    var done = devID;
    dExcept.on('error', function(err) {
      console.log(err);
    });
    dExcept.run(function() {
      var exec = require('child_process').exec,
          child;

      child = exec('node mediaServer.js',
        function (error, stdout, stderr) {
          console.log('stdout: ' + stdout);
          console.log('stderr: ' + stderr);
          if (error !== null) {
            console.log('exec error: ' + error);
          }
      });    
    });
  }

  return {

    InitWebSocketServer : function () {
      runWebSocketServer();
    },

    GetCaptureReady : function (devID) {

      console.log("[NodeWAS] Ready for capturing still image from lumismart..");
      requestCaptureShotReady(devID)

    },

    GetLatestPhoto : function (devID) {
      console.log("[NodeWAS] capturing still image from lumismart..");

      //requestShotTaken(devID);
    }
  }
}();

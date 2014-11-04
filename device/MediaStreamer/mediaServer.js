var request = require("request");
var imgStreamer = require("./lib/imageStreamer.js");
var contentWorker = require("./lib/contentWorker.js");
var watch = require('watch')
var IntervalStream  = require('interval-stream');
var is = new IntervalStream(3000); // emit every 2 seconds

var localStreamPath = ''; // path should be customized by developer or user.. (i.e. ~/Dev/ImageSrc/video)

var writer = new contentWorker({ 
	//path: './video',
	path: localStreamPath, 
	ext: '.jpg'
});

var streamer = new imgStreamer();

var username = "root";
var password = "";
var options = {
    url: "http://127.0.0.1:8080/?action=stream",	// to local server..
    headers: {
     'Authorization': 'Basic ' + new Buffer(username + ':' + password).toString('base64')
   }  
};

watch.createMonitor(localStreamPath, function (monitor) {

	//setInterval(requestMediaStream,	5000);
	requestMediaStream();

	setTimeout(
	  function() {
			  console.log("[Media] Alive...");
	  }, 1000
	);

	monitor.on("created", function (f, stat) {

	  console.log("[Media] new file created..");
	})
});

function requestMediaStream() {
	request(options)
		.pipe(streamer)
		.pipe(is)
		.pipe(writer);
}



//=================== HTTP PORTION ==========================
//===========================================================

var http = require('http');
var fs = require('fs'); // Using the filesystem module
var httpServer = http.createServer(requestHandler);
var url = require('url');
httpServer.listen(4000);

console.log("Listening on 4000");

function requestHandler(req, res) {

	var parsedUrl = url.parse(req.url);
	//console.log("The Request is: " + parsedUrl.pathname);
	
	// Read index.html
	
	fs.readFile(__dirname + parsedUrl.pathname, 
		// Callback function for reading
		function (err, data) {
			// if there is an error
			if (err) {
				res.writeHead(500);
				return res.end('Error loading ' + parsedUrl.pathname);
			}
			// Otherwise, send the data, the contents of the file
			res.writeHead(200);
			res.end(data);
  		}
  	);
}

//=================== WEBSOCKETS PORTION ==========================
//=================================================================

var io = require('socket.io').listen(httpServer);

var timestamp;

io.sockets.on('connection', // This is run for each individual user that connects
	function (socket) {
		console.log("We have a new client: " + socket.id);

		// send client all existing images to index page on connect
		//fileRequest only comes from index.html page 
		socket.on('fileRequest', function(data) {
			console.log("INDEX PAGE CONNECTED!");

			// read all the files in the folder in sequence, using callbacks
			var fs = require("fs");

			fs.readdir( "images", function(err, files) {
			    if (err) {
			        console.log("Error listing file contents.");
			    } else {
			    	
			    	socket.emit("files", files);
			    }
			});
		});

		//find out when mobile device is connected - controls visibility of the capture button 
		socket.on('mobileConnected', function() {
			socket.broadcast.emit('mobileConnected');
			console.log("MOBILE DEVICE CONNECTED!!!!!!!!!");
		});

		socket.on('cameraReady', function() {
			//video is streaming, ready to capture gif
			console.log("CAMERA IS READY");
		});

		socket.on('captureStarted', function() {
			console.log("capturing gif... ")
			socket.broadcast.emit('captureStarted');
		});

		socket.on('touchStarted', function() {
			console.log("TOUCH STARTED +++++++++++ ");
			io.sockets.emit('touchStarted');
		});

		socket.on('touchEnded', function() {
			console.log("TOUCH ENDED ------------ ");
			io.sockets.emit('touchEnded');
		});

		//recieved image from the camera
		socket.on('gif', function(data) {
			socket.broadcast.emit('serverGotGif');
		
			getTimestamp();
			console.log("RECIEVED GIF, SAVING TO THE SERVER!  " + timeStamp);

			//save the image to the server
			var fs = require('fs');

			var searchFor = "data:image/jpeg;base64,";
			var strippedImage = data.slice(data.indexOf(searchFor) + searchFor.length);
			var binaryImage = new Buffer(strippedImage, 'base64');
			fs.writeFileSync(__dirname + '/images/' + timeStamp +'.gif', binaryImage);

			//emit the image back to everyone 
			io.sockets.emit('image',data);
		});

		socket.on('disconnect', function() {
			console.log("Client has disconnected " + socket.id);
		});

		// myPort.on('data', function(data) {
		// 	console.log(data);
		// });
	}
);


function getTimestamp() {
	var d = new Date();
	var day = d.getDate();
	var month = d.getMonth() + 1;	//month starts at 0...
	var hours = d.getHours();
	var minutes = d.getMinutes();
	var seconds = d.getSeconds();

	//TODO - - - - - FORMAT THIS USING A PROTOTYPE FUNCTION????
	if (day < 10) {
		day = '0' + day;
	}
	if (month < 10) {
		month = '0' + month;
	}
	if (hours < 10) {
		hours = '0' + hours; 
	}
	if (minutes < 10) {
		minutes = '0' + minutes;
	}
	if (seconds < 10) {
		seconds = '0' + seconds;
	}

	timeStamp = (d.getFullYear() + '-' + month + '-' + day + '_' +  hours + '-' + minutes + '-' + seconds);
}


//=================== SERIAL COMMUNICATION STUFF ==========================
//=========================================================================

var oldData;

var serialport = require('serialport'),// include the library
   SerialPort = serialport.SerialPort, // make a local instance of it

   portName = '/dev/cu.usbmodem1411';  //connect to my USB port

var myPort = new SerialPort(portName, {
   baudRate: 9600,
   // look for return and newline at the end of each data packet:
   parser: serialport.parsers.readline("\r\n")
});

myPort.on('open', showPortOpen);
myPort.on('data', saveLatestData);
myPort.on('close', showPortClose);
myPort.on('error', showError);

function showPortOpen() {
   console.log('port open. Data rate: ' + myPort.options.baudRate);
}

function saveLatestData(data) {
	if (oldData != data) {
      	console.log(data);
      	oldData = data;

      	if (data == '1') {
      		io.sockets.emit('click');
      	};
      	
   	}
   	///////
   	

}
 
function showPortClose() {
   console.log('port closed.');
}
 
function showError(error) {
   console.log('Serial port error: ' + error);
}

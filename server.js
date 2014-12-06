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

// for saving filenames with timeStamps
var d = new Date();



io.sockets.on('connection', // This is run for each individual user that connects
	function (socket) {
		console.log("We have a new client: " + socket.id);

		// send client all existing images to index page on connect
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

		//recieved image from the camera
		socket.on('gif', function(data) {
		
			var day = d.getDate();

			if (d.getDate() < 10) {
				day = '0' + day;
			}

			var timeStamp = (d.getFullYear() + '-' + (d.getMonth()+1) + '-' + day + '_' +  d.getHours() + '-' + d.getMinutes() + '-' + d.getSeconds());
			console.log("RECIEVED GIF  " + timeStamp);

			//save the image to the server
			var fs = require('fs');

			var searchFor = "data:image/jpeg;base64,";
			var strippedImage = data.slice(data.indexOf(searchFor) + searchFor.length);
			var binaryImage = new Buffer(strippedImage, 'base64');
			fs.writeFileSync(__dirname + '/images/' + timeStamp +'.gif', binaryImage);

			//emit the image back to everyone 
			io.sockets.emit('image',data);
		});


		socket.on('captureStarted', function() {
			console.log("capturing gif... ")
			socket.broadcast.emit('captureStarted');
		});

		
		socket.on('disconnect', function() {
			console.log("Client has disconnected " + socket.id);
		});
	}
);


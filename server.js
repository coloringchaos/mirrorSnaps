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
	console.log("The Request is: " + parsedUrl.pathname);
	
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

var currentImage = null;

io.sockets.on('connection', // This is run for each individual user that connects
	function (socket) {
		console.log("We have a new client: " + socket.id);

		// send client all existing images on index page connect
		socket.on('fileRequest', function(data) {
			console.log("INDEX PAGE CONNECTED!");

			// read all the files in the folder in sequence, using callbacks
			var fs = require("fs");

			fs.readdir( "images", function(err, files) {
			    if (err) {
			        console.log("Error listing file contents.");
			    } else {
			    	
			    	// var fileString = JSON.stringify(files);

			    	// console.log(fileString);

			    	socket.emit("files", files);
			    }
			});
		});

		//recieved image that was sent from camera.html - save this image to the server!
		socket.on('image', function(data) {
			currentImage = data;
			console.log("Received: 'image' ");
			io.sockets.emit('image',data);

			var fs = require('fs');
			var base64Data = data.replace(/^data:image\/webp;base64,/, "");

			fs.writeFile("out.webp", base64Data, 'base64', function(err) {
        		if (err) {
                	console.log(err);
        		} else {
                	console.log("WRote image");
        		}
			});
		});
		
		socket.on('disconnect', function() {
			console.log("Client has disconnected " + socket.id);
		});
	}
);


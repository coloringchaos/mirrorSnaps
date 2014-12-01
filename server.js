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
		//socket.emit(currentImage);
		
		socket.on('image', function(data) {
			currentImage = data;
			console.log("Received: 'image' ");
			io.sockets.emit('image',data);
		});
		
		socket.on('disconnect', function() {
			console.log("Client has disconnected " + socket.id);
		});
	}
);


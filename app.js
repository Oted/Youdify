var port = 3000;
var express = require("express"),
	app = express(),
	routes = require("./routes/index");
	mongoose = require("mongoose"),
	io = require("socket.io").listen(app.listen(port)),
	db = mongoose.connection;

mongoose.connect("mongodb://localhost/test");

db.on('error', console.error.bind(console, 'connection error:'));

db.once('open', function callback () {
	console.log("Database successfuly opened\nExpress is now listening on port "+ port +"\nSocket is now listening on port " + port);
	
	app.set("view engine", "ejs");	
	app.use(express.static(__dirname + '/public'));
	app.enable('trust proxy');

	app.get("/", routes.index);
	app.get("/index.html", routes.index);
	app.get("/playlists/*", routes.playlists);
});

io.sockets.on('connection', function (socket) {
		socket.emit('message', { 
				message: 'welcome to the chat' 
		});		
		socket.on('send', function (data) {
			io.sockets.emit('message', data);
	});
});

process.on('exit', function() {
	console.log("About to exit.");
	console.log("Closing database");
	mongoose.connection.close();
});

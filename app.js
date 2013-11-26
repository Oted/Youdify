port = 3000;
host = "0.0.0.0";
dbName = "test";

var express = require("express"),
	httpProxy = require("http-proxy"),
	app = express(),
	routes = require("./routes/index");
	mongoose = require("mongoose"),
	db = mongoose.connection,
	io = require("socket.io").listen(app.listen(port)),
	socket = require("./socket.js").init(io);


httpProxy.createServer(port, "localhost").listen(80);

//connects to database
mongoose.connect("mongodb://" + host + "/" + dbName);
db.on('error', console.error.bind(console, 'connection error:'));

//opens database, on success set express configurations
db.once('open', function callback () {
	console.log("Database successfuly opened\nExpress and socket is now listening on port "+ host + ":" + port);

	app.set("view engine", "ejs");	
	app.use(express.static(__dirname + '/public'));
	app.enable('trust proxy');

	//Rendering calls
	app.get("/", routes.index);
	app.get("/add/*", routes.add);
	app.get("/index.html", routes.index);
	app.get("/playlists/*", routes.playlists);
	
	//Api calls
	app.get("/checkifexist/*", routes.checkIfExist);
	app.get("/createnewplaylist/*", routes.createNewPlaylist);
	app.get("/push/*", routes.push);
	app.get("/message/*", routes.chatMessage);
});

//on exit, close database
process.on('exit', function() {
	console.log("About to exit.");
	console.log("Closing database");
	mongoose.connection.close();
});

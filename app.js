port = 3000;
host = "0.0.0.0";
dbName = "test";

var express = require("express"),
	httpProxy = require("http-proxy"),
	app = express(),
	flash = require('connect-flash'),
	routes = require("./routes/index"),
	mongoose = require("mongoose"),
	db = mongoose.connection,
	io = require("socket.io").listen(app.listen(port)),
	passport = require("passport"),
	authenticator = require("./authenticator.js");
	socket = require("./socket.js").init(io);

httpProxy.createServer(port, "localhost").listen(80);

//connects to database
mongoose.connect("mongodb://" + host + "/" + dbName);
db.on('error', console.error.bind(console, 'connection error:'));

//opens database, on success set express configurations
db.once('open', function callback(){
	console.log("Database successfuly opened\nExpress and socket is now listening on port "+ host + ":" + port);

	app.use(express.favicon(__dirname + '/public/images/favicon.ico')); 
	app.set("view engine", "ejs");	
	app.use(express.static(__dirname + '/public'));
	app.enable('trust proxy');
	app.use(express.methodOverride());
	app.use(express.cookieParser());
	app.use(express.session({secret: "william",
							 cookie : {maxAge: 360000000}
	}));
	app.use(express.bodyParser());
	app.use(flash());
	app.use(passport.initialize());
	app.use(passport.session());
	app.use(app.router);

	//Rendering calls
	app.get("/", routes.index);
	app.get("/add/*", routes.add);
	app.get("/index.html", routes.index);
	app.get("/playlists/*", routes.playlist(false));

	//authentication rendering of playlist
	app.post("/auth", passport.authenticate("local", { failureFlash: "Invalid passoword :("}),
	function(req, res) {
		var sId = req.sessionID,
			playlistName = req.body.username;

		authenticator.add(sId, playlistName);
		res.send({"auth":true})
	});
	
	//Api calls
	app.get("/checkifexist/*", routes.checkIfExist);
	app.get("/getPlaylists/*", routes.getPlaylists);
	app.get("/createnewplaylist/*", routes.createNewPlaylist);
	app.get("/push/*", routes.push);
	app.get("/deleteVideo/*", routes.deleteVideo);
});

//on exit, close database
process.on('exit', function() {
	console.log("About to exit.");
	console.log("Closing database");
	mongoose.connection.close();
});

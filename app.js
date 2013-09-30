var express = require("express"),
	app = express(),
	routes = require("./routes/index");
	mongoose = require("mongoose"),
	db = mongoose.connection;

mongoose.connect("mongodb://localhost/test");

db.on('error', console.error.bind(console, 'connection error:'));

db.once('open', function callback () {
	console.log("Database successfuly open\nExpress is now listening on port 3000");
	
	app.listen(3000);

	app.set("view engine", "ejs");	
	app.use(express.static(__dirname + '/public'));
	app.enable('trust proxy');

	app.get("/", routes.index);
	app.get("/index.html", routes.index);
	app.get("/playlists/*", routes.playlists);
});

process.on('exit', function() {
	console.log("About to exit.");
	console.log("Closing database");
	mongoose.connection.close();
});

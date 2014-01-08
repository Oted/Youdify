var dbHandler = require("../model/playlist.js"),
	LocalStrategy = require("passport-local").Strategy,
	passport = require("passport"),
	socket = require("../socket.js");

//init passport local strategy
passport.use(new LocalStrategy(
		function(username, password, done){
		dbHandler.checkIfExist(username, function(obj){
			var playlist = obj.doc;
			if (!obj.found) {
				return done(null, false);
			} 
			if (!obj.doc){
				return done(null, false);
			}
			dbHandler.verifyPassword(password, playlist.password, function(isMatch){
				console.log(isMatch);
				if (!isMatch){
					return done(null, false);
				}
				else{
					return done(null, playlist);
				}
			});
		});
	}
));

//render view for local playlist
exports.index = function(req, res){
	console.log("Rendering index for " + req.ip);
 	dbHandler.getAll(function (doc) {
		res.render("firstpage",{ playlists: doc });
	});
};

//render view for adding new songs
exports.add = function(req, res){
	var name = req.query.name;
	console.log("Rendering add view for " + req.ip + " pushing to playlist " + name);
	res.render("addvideos",{name : name});
};

//render view for shared playlist
exports.playlist = function(auth){
return function(req, res){
	var client = req.ip, name;

	if (req.params[0]) name = req.params[0].replace("+"," ");
	else name = req.body.username;
	console.log(name);
	dbHandler.checkIfExist(name, function(data){
		if (data.found){
			res.render("playlist",{
				name : name,
				client : client,
				host: host,
				port: port,
				auth: auth
			});
			dbHandler.update(name);
		}
		else {
			res.send("no such playlist");
		}
	});
};
}

//authenticate for editing a playlist
exports.auth = function(req, res, next){	
	console.log("body parsing", req.body);
	res.render("playlist",{
		name : name,
		client : client,
		host: host,
		port: port,
		auth: true
	});
};

//Api-call for checking if playlist exists
exports.checkIfExist = function(req, res){
	var name = req.query.name.replace("+"," ");
	dbHandler.checkIfExist(name, function(data){
		res.jsonp({"found" : data.found});
	});
};

//Api-call for creating new playlist
exports.createNewPlaylist = function(req, res){
	var client = req.ip,
		name = req.query.name.replace("+"," "),
		password = req.query.password.replace("+"," "),
		description = req.query.desc.replace("+"," "),
		tag = req.query.tag.replace("+"," "),
		freetag = req.query.freetag.replace("+"," ");
	
	dbHandler.createNewPlaylist(name, password, client, description, tag, freetag, function(created){
		res.jsonp({"created" : created});
	});
};

//Api-call for pushing new videos to playlist
exports.push = function(req, res){
	var client = req.ip,
		name = req.query.name.replace("+"," "),
		video = req.query.video;

	res.jsonp({});
	dbHandler.push(name, client, video, function(){
		socket.pushOne(video, name);
	});
};

//get a collection of playlists from the db and return it to the client
exports.getPlaylists = function(req, res){
	var type = req.query.type,
		count = req.query.count,
		client = req.ip;
		
	if (type==="viewed"){
		dbHandler.getMostViewed(count, function(data){
			res.jsonp({"data" : data});
		});
	} else if (type==="visits"){
		dbHandler.getLastVisited(count, function(data){
			res.jsonp({"data" : data});
		});
	} else if (type==="new"){
		dbHandler.getNewest(count, function(data){
			res.jsonp({"data" : data});
		});
	} else if (type==="mine"){
		dbHandler.getMine(client, function(data){
			res.jsonp({"data" : data});
		});
	}
	else{
		res.jsonp({"data" : ""});
	}
};

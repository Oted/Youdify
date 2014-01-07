var dbHandler = require("../model/playlist.js");
var socket = require("../socket.js");

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
exports.playlists = function(req, res){
	var client = req.ip,
		name = req.params[0].replace("+"," ");

	dbHandler.checkIfExist(name, function(data){
		if (data.found){
			res.render("playlist",{
				name : name,
				client : client,
				host: host,
				port: port
			});
			dbHandler.update(name);
		}
		else {
			res.send("no such playlist");
		}
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

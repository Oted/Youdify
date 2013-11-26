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
		description = req.query.desc.replace("+"," "),
		tag = req.query.tag.replace("+"," "),
		freetag = req.query.freetag.replace("+"," ");
	
	dbHandler.createNewPlaylist(name, client, description, tag, freetag, function(created){
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

//Api-call for sending a message to other clients
exports.chatMessage = function(req, res){
	var client = req.ip,
		name = req.query.name.replace("+"," "),
		message = req.query.message;

	socket.message(name, message, client);
};

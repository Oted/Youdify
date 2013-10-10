var dbHandler = require("../model/playlist.js");
var socket = require("../socket.js");

//render view for local playlist
exports.index = function(req, res){
	console.log("Rendering index for " + req.ip);
	res.render("local",{host: host, port: port});
};

//render view for shared playlist
exports.playlists = function(req, res){
var client = req.ip;
var name = req.params[0];
	dbHandler.checkIfExist(name, function(data){
		if (data.found){
			res.render("shared",{
				name : name,
				client : client,
				host: host,
				port: port
			});
		}
		else {
			res.send("no such playlist");
		}
	});
};

//Api-call for checking if playlist exists
exports.checkIfExist = function(req, res){
	var name = req.query.name;
	dbHandler.checkIfExist(name, function(data){
		res.jsonp({"found" : data.found});
	});
};

//Api-call for creating new playlist
exports.createNewPlaylist = function(req, res){
	var client = req.ip;
	var name = req.query.name;
	dbHandler.createNewPlaylist(name, client, function(created){
		res.jsonp({"created" : created});
	});
};

//Api-call for pushing new videos to playlist
exports.push = function(req, res){
	var client = req.ip;
	var name = req.params[0];
	var video = req.query.video;
	console.log(name);
	console.log(client);
	console.log(video);
	dbHandler.push(name, client, video, function(){
		socket.pushOne(video, name);
	});
};

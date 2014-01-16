var dbHandler = require("../model/playlist.js"),
	socket = require("../my_modules/socket.js"),
	authenticator = require("../my_modules/authenticator.js");

//render view for local playlist
exports.index = function(req, res){
	console.log("Rendering index for " + req.ip);
	dbHandler.getAll(function (doc) {
		res.render("firstpage",{ playlists: doc });
	});
};

//redirector
exports.redirector = function(req, res){
	res.redirect("http://" + host + ":" + port + "/directplay/");
};

//render view for directplay
exports.directplay = function(req, res){
	console.log("Rendering directplay for " + req.ip);
	res.render("directplay");
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

		dbHandler.checkIfExist(name, function(data){
			if (data.found){
				res.render("playlist",{
					name : name,
					client : client,
					host: host,
					port: port,
					auth: auth,
					locked: data.doc.locked,
					description: data.doc.description,
					category: data.doc.category,
					freetag: data.doc.freetag,
					videos: data.doc.videos.length
				});
				dbHandler.update(name);
			}
			else {
				res.send("no such playlist :(");
			}
		});
	};
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

//Api-call for pushing new videos to a playlist
exports.push = function(req, res){
	var client = req.ip,
		name = req.query.name.replace("+"," "),
		video = req.query.video,
		id = req.query.id,
		sID = req.sessionID;

	dbHandler.checkIfExist(name, function(data){
		if (data.found){
			if (authenticator.isAuthenticated(sID, name) || (data.doc.locked==="false")){
				res.jsonp({"pushed":true});
				dbHandler.push(data.doc, client, video, function(){
					socket.pushOne(video, name);
				});
			}else{
				res.jsonp({"pushed":false});
			}
		}
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

//delete a video from the list
exports.deleteVideo = function(req, res){
	var name = req.query.name.replace("+"," "),
		id = req.query.id,
		sID = req.sessionID;

	if (authenticator.isAuthenticated(sID, name)){
		dbHandler.deleteVideo(name, id);
		res.jsonp({});
	}else{
		res.jsonp({});
	}

};

//update a playlists properties
exports.updatePlaylist = function(req, res){	
	var obj = {
		"oldname" : req.query.oldname.replace("+"," "),
		"name" : req.query.name.replace("+"," "),
		"desc" : req.query.desc.replace("+"," "),
		"tag" : req.query.tag.replace("+"," "),
		"locked" : req.query.locked.replace("+"," "),
		"freetag" : req.query.freetag.replace("+"," ")
	},
	name = req.query.oldname.replace("+"," "),
	sID = req.sessionID;

	if (authenticator.isAuthenticated(sID, name)){
		dbHandler.updatePlaylist(obj,function(updated){
			if (updated){
				res.jsonp({"updated":"true"});
				socket.playlistChange(obj);
			}
			else{
				res.jsonp({"updated":"false"});
			}		
		});
	}else{
		res.jsonp({"updated":"false"});
	}	
};

//search for the playlists with names :)
exports.searchPlaylistsByName = function(req, res){
	var query = req.query.query.replace("+", " ");
	if (query.length > 2){
		dbHandler.getPlaylistsWithName(query, function(data){
			res.jsonp({"data" : data});
		});
	}else{
		res.jsonp({"data" : {}});
	}
};

//search for the playlists with the freetag
exports.searchPlaylistsByFreetag = function(req, res){
	var query = req.query.query.replace("+", " ");
	
	if (query.length > 1){
		dbHandler.getPlaylistsWithFreetag(query, function(data){
			res.jsonp({"data" : data});
		});
	}else{
		res.jsonp({"data" : {}});
	}
};

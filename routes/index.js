var dbHandler = require("../model/playlist.js");

//render index view for basic requests
exports.index = function(req, res){
	console.log("Rendering index for " + req.ip);
	res.render("index",{host: host, port: port});
};

//handles api request for playlists
exports.playlists = function(req, res){
	var client = req.ip;

	if (req.query.callback && req.query.f && req.query.q && req.query.q!==""){
		var funct = req.query.f;
		var query = req.query.q;

		//request demanded to check if playlist exists
		if (funct === "checkIfExist"){
			dbHandler.checkIfExist(query, function(data){
				res.jsonp({"found" : data.found});
			});
		}

		//request demanded to create new playlist
		else if (funct === "createNewPlaylist"){
			dbHandler.createNewPlaylist(query, client, function(created){
				res.jsonp({"created" : created});
			});
		}

		//request demanded to push entety into playlist
		else if (funct ==="push"){
			var video = req.query.video;
			dbHandler.push(query, client, video, function(){
				socket.pushOne(video, query);
			});
		}
	}
	else{
		//otherwise the request is a request to render a playlist view
		var q = req.params[0];
		dbHandler.checkIfExist(q, function(data){
			if (data.found){
				res.render("playlist",{
						name : q,
						client : client,
						host: host,
						port: port
				});
			}
			else {
				res.send("no such playlist");
			}
		});
	}
};

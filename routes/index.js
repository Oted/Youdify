var dbHandler = require("../model/playlist.js");

exports.index = function(req, res){
	console.log("Rendering index for " + req.ip);
	res.render("index");
};

exports.playlists = function(req, res){
	console.log("Request received!");
	if (req.query.callback && req.query.f && req.query.q && req.query.q!==""){
		var f = req.query.f;
		var q = req.query.q;
		var client = req.ip;

		//request demanded to check if playlist exists
		if (f === "checkIfExist"){
			dbHandler.checkIfExist(q, function(found){
				res.jsonp({"found" : found});
			});
		}
		else if (f === "createNewPlaylist"){
			dbHandler.createNewPlaylist(q, client, function(created){
				res.jsonp({"created" : created});
			});
		}
		else if (f ==="push"){
			var id = req.query.video;
			dbHandler.push(q, client, id);
		}
	}
	else{
		var q = req.params[0];
		dbHandler.checkIfExist(q, function(found){
			res.render("playlist");
		});
	}
};

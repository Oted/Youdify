var mongoose = require("mongoose");

//playlist schema
var playlistSchema = new mongoose.Schema({
	name: String,
	creator: String,
	category: String,
	freetag: String,
	description: String,
	timesvisited: Number,
	lastvisited: { type: Date, default: Date.now },
  	date: { type: Date, default: Date.now },
	videos: [{type: String, trim: true}]
});

//add playlist schema to db
var Playlist = mongoose.model("Playlists", playlistSchema);
	
//checks if a playlist with as given name exists, if it does the ducument is returned
exports.checkIfExist = function(name, callback){
	console.log("Checking if playlist " + name + " exists..");
	Playlist.findOne({"name" : name}, function(error, doc){
		if (doc){
			console.log(name + " was found");
			callback({
				"doc" : doc,
				"found" : true
			});
		}
		else{
			console.log(name + " was not found");
			callback({"found": false});
		}	
	});
};

//find a playlist that belongs to a client
exports.getMyPlaylists = function(client, callback){
	Playlist.find({"creator": client}, function(err, docs){
		console.log(docs);		
	});	
};

//creates a new playlist with the given name
exports.createNewPlaylist = function(name, client, description, tag, freetag, callback){
	this.checkIfExist(name,function(data){
		if (!data.found){
			var newPlaylist = new Playlist({
				"name"   : name,
				"creator": client,
				"category": tag,
				"freetag" : freetag,
				"description": description,
				"date" 	 : new Date(),
				"lastvisited" : new Date(),
				"timesvisited" : 1,
				"videos" : []
			});
				
			newPlaylist.save(function(error){
				if (error){
					console.log("Error while creating playlist\n" + error);
					callback(false);
				}
				else{
					console.log("New playlist created");
					callback(true);
				}
			});
		}
	});
}
	
//push a video to a given playlist
exports.push = function(name, client, videoId, callback){	
	this.checkForVideo(name, videoId, function(found){
		if (!found){
			Playlist.findOneAndUpdate({"name": name},
				{$push: {"videos": videoId}},
				{safe: true, upsert: true},
				function(err, model) {
					if (model){
						callback();
					}
				}
			);
		}
		else{
			callback();
		}
	});
};

//chekck if a video exist in a playlist
exports.checkForVideo = function(name, videoId, callback){
	var videos, found, vid;
	console.log("in check for video : " + videoId);
	this.checkIfExist(name,function(data){
		if (data.found){
			videos = data.doc.videos;
			found = false;
			for (var i = 0; i < videos.length; i++){
				if (videoId === videos[i]){
					found = true;
				}
			}
			callback(found);
		}
		else{
			callback(false);
		}	
	});	
}

//gets a playlist with a given name (uses check if exists)
exports.get = function(name, callback){
	this.checkIfExist(name,function(data){
		if (data.found){
			callback(data.doc.videos)
		}
	});
};

//gets all playlists
exports.getAll = function(callback){
	Playlist.find(function(error, doc){
		for (var i = 0; i < doc.length; i++){
			var number = doc[i].videos.length;
			doc[i].videos = number + "";
		}
		callback(doc);
	});
};

exports.update = function(name){
	Playlist.update({"name": name}, {$inc: {"timesvisited" : 1}, $set: {"lastvisited":new Date()}},  function(err){
		if (err) console.log("Error in database update : \n" + err);	
	});
};	

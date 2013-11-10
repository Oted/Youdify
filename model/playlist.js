var mongoose = require("mongoose");

//playlist schema
var playlistSchema = new mongoose.Schema({
	name: String,
	creator: String,
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
exports.createNewPlaylist = function(name, client, callback){
	this.checkIfExist(name,function(data){
		if (!data.found){
			var newPlaylist = new Playlist({
				"name"   : name,
				"creator": client,
				"date" 	 : new Date(),
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
exports.push = function(name, client, video, callback){	
	var videoObj = JSON.parse(video);
	this.checkForVideo(name, videoObj, function(found){
		if (!found){
			console.log("Pushing " + video);
			Playlist.findOneAndUpdate({"name": name},
				{$push: {"videos": video}},
				{safe: true, upsert: true},
				function(err, model) {
					if (model){
						callback();
					}
				}
			);
		}
		else{
			console.log("Video " + videoObj.title + " already exist in the playlist");
		}
	});
};

//chekck if a video exist in a playlist
exports.checkForVideo = function(name, video, callback){
	var videos, found, vid;
	console.log("in check for video : " + video.id);
	this.checkIfExist(name,function(data){
		if (data.found){
			videos = data.doc.videos;
			found = false;
			for (var i = 0; i < videos.length; i++){
				try{
					vid = JSON.parse(videos[i]);
				}catch(error){
					console.log("ERROR IN VIDEOS checkForVideo: probably wring format för JSON parse\nerror");
				}
				if (vid.id === video.id){
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

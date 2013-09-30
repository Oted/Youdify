var mongoose = require("mongoose");

var playlistSchema = new mongoose.Schema({
	name: String,
	creator: String,
  	date: { type: Date, default: Date.now },
	videos: [{type: String, trim: true}]
});

var Playlist = mongoose.model("Playlists", playlistSchema);
	

	exports.checkIfExist = function(name, callback){
		console.log("Checking if playlist " + name + " exists..");
		Playlist.findOne({"name" : name}, function(error, doc){
			if (doc){
				console.log(name + " was found");
				callback(true);
			}
			else{
				console.log(name + " was not found");
				callback(false);
			}	
		});
	};

	exports.getMyPlaylists = function(client, callback){
		Playlist.find({"creator": client}, function(err, docs){
			console.log(docs);		
		});	
	};

	exports.createNewPlaylist = function(name, client, callback){
		this.checkIfExist(name,function(found){
			if (!found){
				var newPlaylist = new Playlist({
					"name"   : name,
					"creator": client,
					"date" 	 : new Date(),
					"videos" : []
				});
				
				newPlaylist.save(function(error){
					if (error){
						console.log("Error while creating ne playlist\n" + error);
						callback(false);
					}
					else{
						console.log("New playlist created");
				 		callback(true);
					}
				});
			}
		});
	};
	
	exports.push = function(name, client, video){	
		//Playlist.find()
			
		console.log("Pushing " + video);
		Playlist.findOneAndUpdate({"name": name},
			{$push: {"videos": video}},
			{safe: true, upsert: true},
			function(err, model) {
				console.log(err);
			}
		);
	};

	exports.get = function(name, client, videos){

	};

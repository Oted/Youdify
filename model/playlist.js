var mongoose = require("mongoose"),
	bcrypt = require("bcrypt");

//playlist schema
var playlistSchema = new mongoose.Schema({
    name: { type: String, required: true, index: { unique: true } },
	password : String,
	creator: String,
	category: String,
	freetag: String,
	description: String,
	timesvisited: Number,
	lastvisited: { type: Date, default: Date.now },
  	date: { type: Date, default: Date.now },
	videos: [{type: String, trim: true}],
	locked: String
});

//add playlist schema to db
var Playlist = mongoose.model("Playlists", playlistSchema);

//checks if a playlist with as given name exists, if it does the ducument is returned
exports.checkIfExist = function(name, callback){
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

//creates a new playlist with the given name
exports.createNewPlaylist = function(name, password, client, description, tag, freetag, callback){
	this.checkIfExist(name,function(data){
		if (!data.found){
			//encrypt password before saving
			encrypt(password, function(hashPassword){
				var newPlaylist = new Playlist({
					"name"   : name,
					"password": hashPassword,
					"creator": client,
					"category": tag,
					"freetag" : freetag,
					"description": description,
					"date" 	 : new Date(),
					"lastvisited" : new Date(),
					"timesvisited" : 1,
					"videos" : [],
					"locked" : false
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
			});
		}
		else{
			callback(false);
		}
	});
}

//encrypt password
var encrypt = function(password, callback){
	bcrypt.genSalt(10, function(err, salt){
		if (err) throw err;
		else{
			bcrypt.hash(password, salt, function(err, hash){
				if (err) throw err;
				else{
					callback(hash);
				}		
			});

		}
	});
};

//compare a passwords
exports.verifyPassword = function(candidatePassword, password, callback) {
	bcrypt.compare(candidatePassword, password, function(err, isMatch) {
        if (err) throw err;
		else callback(isMatch);
    });
};

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

//delete a video from the playlist
exports.deleteVideo = function(name, videoId){
	var videos, index = -1;
	this.checkIfExist(name,function(data){
		if (data.found){
			videos = data.doc.videos;
			for (var i = 0; i < videos.length; i++){
				if (videoId === videos[i]){
					index = i;
				}
			}
			console.log("Delete video with index : " + index);
			if (index != -1)                
				videos.splice(index, 1);
				data.doc.save();
			}
	});	
};

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

//update the values of timesvisited and lastvisited, called each time a playlist is visited
exports.update = function(name){
	Playlist.update({"name": name}, {$inc: {"timesvisited" : 1}, $set: {"lastvisited":new Date()}},  function(err){
		if (err) console.log("Error in database update : \n" + err);	
	});
};

//returns the playlist with largest timesvisited value
exports.getMostViewed = function(count, callback){
	Playlist.find().sort({"timesvisited": -1}).limit(count).exec(function(err, doc) {
		if (!err){
			for (var i = 0; i < doc.length; i++){
				var number = doc[i].videos.length;
				doc[i].videos = number + "";
			}
			callback(doc);
		}
		else{
			console.log("Error in getMostViewed: \n" + err)
		}
	});
}

//get the platylist with latest visit date
exports.getLastVisited = function(count, callback){
	Playlist.find().sort({"lastvisited": -1}).limit(count).exec(function(err, doc) {
		if (!err){
			for (var i = 0; i < doc.length; i++){
				var number = doc[i].videos.length;
				doc[i].videos = number + "";
				doc[i].creator = "";
			}
			callback(doc);
		}
		else{
			console.log("Error in getLastVisited: \n" + err)
		}
	});
}

//get the "newest" playlists
exports.getNewest = function(count, callback){
	Playlist.find().sort({"date": -1}).limit(count).exec(function(err, doc) {
		if (!err){
			for (var i = 0; i < doc.length; i++){
				var number = doc[i].videos.length;
				doc[i].videos = number + "";
				doc[i].creator = "";
			}
			callback(doc);
		}
		else{
			console.log("Error in getNewest: \n" + err)
		}
	});
}

//returns all playlists created with a specoific ip-address
exports.getMine = function(client, callback){
	Playlist.find({creator: client}, function(err, doc){
		if (!err){
			for (var i = 0; i < doc.length; i++){
				var number = doc[i].videos.length;
				doc[i].videos = number + "";
				doc[i].creator = "";
			}
			callback(doc);
		}
		else{
			console.log("Error in getMine: \n" + err)
		}
	});	
};

//updates the given values in the playlists
exports.updatePlaylist = function(obj, callback){
	console.log("in update playlist with oldname : " + obj.oldname);
	Playlist.update({"name": obj.oldname}, 
	{$set: {
			"name":obj.name, 
			"description":obj.desc, 
			"freetag":obj.freetag, 
			"locked":obj.locked,
			"category":obj.tag
	}}, 
	function(err){
		if (err){ 
			console.log("Error in database update : \n" + err);	
			callback(false);
		}
		else {
			callback(true);
		}
	});
};



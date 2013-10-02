var dbHandler = require("./model/playlist.js");
var that = this;

//init
exports.init = function(io){
	io.sockets.on("connection", function (socket) {
		that.io = io;
		socket.emit("register", {message:"Hello and welcome"});	
		
		socket.on("ok", function(data){
			console.log("client " + data.client + " is now registered to playlist " + data.name); 		
			socket.join(data.name+"");
			that.pushAll(data.name, data.client);
		});
	});
};

//push one new video to all clients in the same room (attached to the same playlist)
exports.pushOne = function(video, name){
	that.io.sockets.in(name+"").emit("push", {video: video});
}

//push all videos in a playlist to a client (used when a new client connect)
exports.pushAll = function(name){
	dbHandler.get(name,function(videos){
		videos.forEach(function(video){	
			//that.socket.emit("push",{video: v});	
			that.io.sockets.in(name+"").emit("push", {video: video});
		});
	});
};


var dbHandler = require("./model/playlist.js");
var that = this;

//init
exports.init = function(io){
	that.io = io;
	io.sockets.on("connection", function (socket) {
		socket.emit("register", {});	
		
		//ack
		socket.on("ok", function(data){
			var name   = data.name,
				client = data.client;
				
			
			console.log("client " + client + " is now registered to playlist " + name); 		
			socket.join(name);
			
			//push all videos
			that.pushAll(socket, name, client);
			
			//tell the others that client has joined
			that.io.sockets.in(name).emit("newClient", {client: data.client, 
													   clients: io.sockets.clients(name).length
			});
			
			//on disconnect, tell the others
			socket.on("disconnect", function(){
				that.io.sockets.in(name).emit("clientLeave", {client: data.client,
															clients: io.sockets.clients(name).length-1
				});
			});
		
			//on message, send to all
			socket.on("message", function(obj){
				that.io.sockets.in(name).emit("chatMessage", obj);
			});

			socket.on("joinChat", function(obj){
				that.io.sockets.in(name).emit("chatJoin", obj);	
			});
		});	
	});
};

//chat message received
exports.message = function(name, message, client){
	var bajs = that.io.sockets.clients(name);
	that.io.sockets.in(name).emit("chatMessage", {message: message + ":" + bajs.length, client: client});
};

//push one new video to all clients in the same room (attached to the same playlist)
exports.pushOne = function(video, name){
	that.io.sockets.in(name).emit("push", {video: video});
}

//push all videos in a playlist to a client (used when a new client connect)
exports.pushAll = function(socket, name, client){
	dbHandler.get(name,function(videos){
		videos.forEach(function(video){	
			socket.emit("push", {video: video});
		});
	});
};

exports.chatMessage = function(){
 	

};

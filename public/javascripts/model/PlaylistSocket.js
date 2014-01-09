(function(win, doc, $, undefined){
	"use strict";

	var PlaylistSocket = function(Mediator){	
		this.Mediator = Mediator;
		this.Mediator.subscribe("sendMessage", this.sendMessage.bind(this));	
		this.Mediator.subscribe("joinChat", this.joinChat.bind(this));
		
		var n = doc.getElementById("name-div").value;
		var c = doc.getElementById("client-div").value;
		var h = doc.getElementById("host-div").value;
		var p = doc.getElementById("port-div").value;
		
		var socket = io.connect("http://" + h + ":" + p + "/" + name);
		this.socket = socket;
		
		socket.on("register", function(data){
			socket.emit("ok", {name : n, client: c});
		});	
		
       	//on videos
		socket.on("push",function(obj){
			var video = Mediator.write("videoPushed", obj.video);
		});
		
		//the name has changed, redirect all users
		socket.on("playlistnamechanged", function(obj){
			var url;
			Mediator.write("warningMessage","Authenticated user has changed the name of this playlist, you will be redirected there");
			url = "http://" + doc.domain + ":" + location.port + "/playlists/" + obj.newname;
			win.location = url;
		});

		//quick! tell the others im here ! :3	
		socket.on("newClient",function(obj){
			Mediator.write("newClient", obj);
		});
		
		//Haii guyss im here!! :)
		socket.on("chatJoin",function(obj){
			Mediator.write("chatJoin", obj);
		});
		
		//sry guis, have to leave :(
		socket.on("clientLeave",function(obj){
			Mediator.write("clientLeave", obj);
		});

		//here u go, message! :D
		socket.on("chatMessage",function(obj){
			Mediator.write("chatMessage", obj);
		});
	};

	//this client joins the chat, tell the server
	PlaylistSocket.prototype.joinChat = function(obj){
		console.log("Im gna join the chat!");
		this.socket.emit("joinChat", obj);	
	};
	
	//this client sends a message in the chat, tell the server
	PlaylistSocket.prototype.sendMessage = function(obj){
		this.socket.emit("message", obj);	
	};


	//decodes the replacement that was from the pusher
	var replaceChars = function(video){
		return video.replace("//a","&").replace("//p","%");
	};

	exports.PlaylistSocket = PlaylistSocket;
})(window, document); 	

(function(win, doc, $, undefined){
	"use strict";

	var PlaylistSocket = function(Mediator){	
		this.Mediator = Mediator;
		this.Mediator.subscribe("sendMessage", this.sendMessage.bind(this));	
		
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

		//quick! tell the others im here ! :3	
		socket.on("chatJoin",function(obj){
			console.log("chat join\n" + obj.clients);
			var video = Mediator.write("chatJoin", obj);
		});
		
		//sry guis, have to leave :(
		socket.on("chatLeave",function(obj){
			console.log("chat leave\n" + obj.clients);
			var video = Mediator.write("chatLeave", obj);
		});
		
		//here u go, message! :D
		socket.on("chatMessage",function(obj){
			console.log("chat message : " + obj.message);
			var video = Mediator.write("chatMessage", obj.message);
		});
	};

	PlaylistSocket.prototype.sendMessage = function(message){
		this.socket.emit("message", {message : message});	
	};

	//decodes the replacement that was from the pusher
	var replaceChars = function(video){
		return video.replace("//a","&").replace("//p","%");
	};

	exports.PlaylistSocket = PlaylistSocket;
})(window, document); 	

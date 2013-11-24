(function(win, doc, $, undefined){
	"use strict";

	var PlaylistSocket = function(Mediator){	
		this.Mediator = Mediator;
		
		var n = doc.getElementById("name-div").value;
		var c = doc.getElementById("client-div").value;
		var h = doc.getElementById("host-div").value;
		var p = doc.getElementById("port-div").value;
		
		var socket = io.connect("http://" + h + ":" + p + "/" + name);
			
		socket.on("register", function(data){
			console.log(data.message);
			socket.emit("ok", {name : n, client: c});
		});	
				
		socket.on("push",function(obj){
			var video = Mediator.write("videoPushed", obj.video);
		});
		
		socket.on("chatMessage",function(obj){
			var video = Mediator.write("chatMessage", obj.message);
		});
	};

	//decodes the replacement that was from the pusher
	var replaceChars = function(video){
		return video.replace("//a","&").replace("//p","%");
	};

	exports.PlaylistSocket = PlaylistSocket;
})(window, document); 	

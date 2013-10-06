(function(win, doc, $, undefined){
	"use strict";
	var BMAP = win.BMAP || {};

	var PlaylistSocket = function(){	
		var n = $("#name-div").val();
		var c = $("#client-div").val();
		var h = $("#host-div").val();
		var p = $("#port-div").val();
		
		var socket = io.connect("http://" + h + ":" + p + "/" + name);
			
		socket.on("register", function(data){
			console.log(data.message);
			socket.emit("ok", {name : n, client: c});
		});	
				
		socket.on("push",function(data){
			var video = JSON.parse(replaceChars(data.video));
			BMAP.VideoController.generateResultDiv(video);
		});
	};

	//decodes the replacement that was from the pusher
	var replaceChars = function(video){
		return video.replace("//a","&").replace("//p","%");
	};


	BMAP.PlaylistSocket = PlaylistSocket;
	win.BMAP = BMAP;
})(window, document, jQuery); 	

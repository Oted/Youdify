(function(win, doc, $, undefined){
	"use strict";
	$(function(){
		PlaylistController();
	});
		
	var PlaylistController = function(){
		var videos = [];
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
			$("#videos").text(JSON.parse(data.video).title);
			console.log(data);		
		});

	}
})(window, document, jQuery);	

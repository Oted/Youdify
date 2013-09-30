(function(win, doc, undefined){
	"use strict";
	win.onload = function(){	
		var messages = [];
		var socket = io.connect("http://localhost:3000");
		var field = doc.getElementById("input");
		var sendButton = doc.getElementById("send");
		var content = doc.getElementById("content");

		socket.on("message", function(data){
			if (data.message){
				messages.push(data.message);
				var html = "";
				messages.forEach(function(message){
					html += message + "<br />";		
				});
				content.innerHTML = html;
			}
			else {
				console.log("Data contains no maeeage :(");
			}	
		});
	
		sendButton.onclick = function(){
			var text = field.value;
			socket.emit("send", {message: text});
		};
	}
})(window, document);	

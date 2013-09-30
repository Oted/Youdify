(function(win, doc, undefined){
	"use strict";
	win.onload = function(){	
		var messages = [];
		var socket = io.connect("http://localhost:3000");
		var field = doc.getElementById("input");
		var sendButton = doc.getElementById("send");
		var content = doc.getElementById("content");

		socket.on("message", function(data){
			if (data.messages){
				messages.push(data.message);
				var html = "";
				messages.forEach(function(message){
					html += message + "<br />";		
				});
				constent.innerHTML = html;
			}
			else {
				console.log("Data contains no maeeage :(");
			}	
		});
	
		sendButton.onClick = function(){
			var text = field.innerText || field.innerHTML;
			socket.emit("send", {message: text});
		};
	}
})(window, document);	

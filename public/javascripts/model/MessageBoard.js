(function(win, doc, $, undefined){
	"use strict";

	//constructor for MessageBoard
	var MessageBoard = function(Mediator){
		this.Mediator = Mediator;
		this.messageEl = $("#message-board");
		
		this.Mediator.subscribe("temporaryMessage", putTemporary.bind(this));	
		this.Mediator.subscribe("permanentMessage", putPermanent.bind(this));	
		this.Mediator.subscribe("warningMessage", putWarning.bind(this));	
	};
	
	var putPermanent = function(message){
		this.message = message;
		this.messageEl.text(message);
	};

	var putTemporary = function(message){
		var that = this;
		that.messageEl.fadeOut("slow", function(){
			that.messageEl.html(message).fadeIn("slow");
		});
		
		setTimeout(function(){		
			that.messageEl.fadeOut("slow", function(){
				that.messageEl.html(that.message).fadeIn("slow");
			});
		},3000);	
	};

	var putWarning = function(message){
		alert(message);
	};

	exports.MessageBoard = MessageBoard;
})(window, document, jQuery);

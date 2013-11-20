(function(win, doc, $, undefined){
	"use strict";
	var BMAP = win.BMAP || {};

	var MessageBoard = function(){
		this.messageEl = $("#message-board");
		
		BMAP.Mediator.subscribe("temporaryMessage", putTemporary.bind(this));	
		BMAP.Mediator.subscribe("permanentMessage", putPermanent.bind(this));	
		BMAP.Mediator.subscribe("warningMessage", putWarning.bind(this));	
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

	BMAP.MessageBoard = MessageBoard;
	win.BMAP = BMAP;
})(window, document, jQuery);

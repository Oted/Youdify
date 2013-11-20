;(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
(function(win, doc, $, undefined){
	"use strict";
	var BMAP = win.BMAP || {},
		IFRAME_SRC;

	var SharedFeatures = function(){	
		var that = this;

		this.addVideoEl = $("#add-video").on("click", this.toggleAddVideo.bind(this)).attr("title",
			"Add new video to the playlist"		
		);

		this.overlayEl = $("#overlay-background").on("click", this.toggleAddVideo.bind(this));

		this.emptyQueEl	= $("#empty-queue").on("click", this.emptyQueue.bind(this)).attr("title",
			"Empty the queue"		
		);

		this.addNewToQueEl = $("#add-new-to-queue").on("click", this.toggleAddNewToQue.bind(this)).attr("title",
			"Toggle add new to queue, if this is enabled videos pushed by anyone will be added to queue and played automatically"		
		);

		IFRAME_SRC = $("#overlay-wrapper").attr("src");
		this.overlayed = false;
		this.addNewToQue = false;
	};	

	//empty the queue
	SharedFeatures.prototype.emptyQueue = function(){
		//BMAP.YoutubePlayer.emptyQueue();
	};

	//back and forth between adding videos and playlist
	SharedFeatures.prototype.toggleAddVideo = function(){
		//load the iframe
		this.overlayed = !this.overlayed;

		if (!this.overlayed){
			console.log(IFRAME_SRC);
			$("#overlay-wrapper").attr("src", "#");
			$("#overlay-wrapper").toggle(400);	
			$("#main-sidebar").toggle();
    		$("#player").toggle();
    		$("#overlay-background").toggle(100);
    		$("body").toggleClass('no-scrolling');
		}
		else{
			$("#overlay-wrapper").attr("src", IFRAME_SRC);
			$("#overlay-wrapper").load(function(){
				
			});
			
			$("#overlay-wrapper").toggle(400);	
			$("#main-sidebar").toggle();
    		$("#player").toggle();
    		$("#overlay-background").toggle(100);
    		$("body").toggleClass('no-scrolling');	
		}
	};

	//returns the bool addNewToQue
	SharedFeatures.prototype.getAddNewToQue = function(){
		return this.addNewToQue;
	};
			
	//toggle addNewToQue (add pushed songs to queue)
	SharedFeatures.prototype.toggleAddNewToQue = function(){
		$(this.addNewToQueEl).toggleClass("active");
		
		this.addNewToQue = !this.addNewToQue;
		if (this.addNewToQue){
			//BMAP.MessageBoard.putTemporary("New videos will now be added to this queue");
		}
		else {
			//BMAP.MessageBoard.putTemporary("Add new to queue is now off");
		}
		//code for animations here
		return false;
	};

	BMAP.SharedFeatures = SharedFeatures;
	win.BMAP = BMAP;
	exports.SharedFeatures = SharedFeatures;
})(window, document, jQuery);

},{}],2:[function(require,module,exports){
(function(win, doc, $, undefined){
    "use strict";
	var BMAP = win.BMAP || {};
	
	//the first to run when document is ready
    $(function(){
		//stupid firefox bugfix
		$("#main-sidebar").toggle().toggle();

		var templateEl = generateTemplate();
		var resultEl       		= $("#search-results");	

		var SharedFeatures		= require("./SharedFeatures.js");

		BMAP.YoutubePlayer		= new BMAP.YoutubePlayer(280,200);		
		BMAP.VideoController	= new BMAP.VideoController(templateEl, resultEl);		
		//BMAP.SharedFeatures		= new SharedFeatures();
		BMAP.SearchMachine		= new BMAP.SearchMachine();		
		BMAP.PlaylistSocket		= new BMAP.PlaylistSocket();
		BMAP.MessageBoard		= new BMAP.MessageBoard();
	});

	var generateTemplate = function(){
		var element = doc.createElement("div"),
			thumbDiv = doc.createElement("div"),
			subTitleDiv = doc.createElement("div"),
			queue = doc.createElement("button"),	
			hide = doc.createElement("button"),	
			title = doc.createElement("h3"),
			thumb = doc.createElement("img");

		$(element).addClass("video");

		$(thumbDiv).addClass("grid-1")
		.appendTo(element);
	
		$(title).addClass("title grid-6")
		.appendTo(element);

		$(thumb).addClass("thumb grid-1")
		.appendTo(thumbDiv);
	
		$(queue).addClass("grid-1 add-to-queue")
		.html("Queue")
		.attr("title", "Add this video to the que")
		.appendTo(thumbDiv);
	
		$(hide).addClass("grid-1 hide-video")
		.html("Remove")
		.attr("title", "Remove this video from the list, the video will still be in the list efter refresh")
		.appendTo(thumbDiv);

		$(subTitleDiv).addClass("subtitle")
		.appendTo(element);

		return element;
	};


	win.BMAP = BMAP;
})(window, document, jQuery);

},{"./SharedFeatures.js":1}]},{},[2])
;
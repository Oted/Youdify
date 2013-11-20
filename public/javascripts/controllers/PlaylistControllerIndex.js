// this file hadles the UI for a Playlist
(function(win, doc, $, undefined){	
  	"use strict"
	
	//the first to run when document is ready
	$(function(){
		$("#main-sidebar").toggle().toggle();

		//Create new PlaylistController
		new PlaylistControllerIndex();	
	});
	
	//contructor of PlaylistController
	var PlaylistControllerIndex = function(){
		this.Mediator = require("../Mediator.js").Mediator;
		
		var YoutubePlayer = require("../model/YoutubePlayer.js").YoutubePlayer;
		new YoutubePlayer(this.Mediator,280, 200);
	
		var SearchMachine = require("../model/SearchMachine.js").SearchMachine;
		new SearchMachine(this.Mediator);

		var PlaylistSocket = require("../model/PlaylistSocket.js").PlaylistSocket;
		new PlaylistSocket(this.Mediator);

		var MessageBoard = require("../model/MessageBoard.js").MessageBoard;
		new MessageBoard(this.Mediator);

		this.Mediator.subscribe("playerStateChange", playerStateChange.bind(this));
		this.Mediator.subscribe("removeVideo", removeVideo.bind(this));
		this.Mediator.subscribe("resultsChange", resultsChange.bind(this));
		this.Mediator.subscribe("videoPushed", this.videoPushed.bind(this));

		this.resultEl       = $("#video-list");
		this.iframeSrc 		= $("#overlay-wrapper").attr("src");

		this.overlayed 		= false;
		this.addNewToQue 	= false;		
		this.isPlaying 		= false;		
		this.results 		= [];
		
		this.initUI();
	};	

	//bind and set attr on UI controls
	PlaylistControllerIndex.prototype.initUI = function(){
		this.overlayEl 		= $("#overlay-wrapper");
		
		this.overlayBEl 	= $("#overlay-background")
		.on("click", this.toggleAddVideo.bind(this));
		
		this.addVideoEl 	= $("#add-video")
		.on("click", this.toggleAddVideo.bind(this))
		.attr("title","Add new video to the playlist");
		
		this.emptyQueEl		= $("#empty-queue")
		.on("click", this.emptyQueue.bind(this))
		.attr("title","Empty the queue");
		
		this.addNewToQueEl 	= $("#add-new-to-queue")
		.on("click", this.toggleAddNewToQue.bind(this))
		.attr("title","Toggle add new to queue, if this is enabled videos pushed by anyone will be added to queue and played automatically");
  		
		this.playEl 		= $("#play")
		.on("click", this.play.bind(this))
		.attr("title","Play or pause video");

		this.forwardEl 		= $("#next")
		.on("click", this.forward.bind(this))
		.attr("title","Play the next video");
		
		this.previousEl		= $("#prev")
		.on("click", this.previous.bind(this))
		.attr("title","Play previous video");
		
		this.shuffleEl		= $("#shuffle")
		.on("click", this.toggleShuffle.bind(this))
		.attr("title","Toggle shuffle");
		
		this.autoplayEl		= $("#autoplay")
		.on("click", this.toggleAutoplay.bind(this))
		.attr("title","Toggle autoplay, if autoplay is enabled player will keep playing when queue is empty");
		
		this.repeatEl		= $("#repeat")
		.on("click", this.toggleRepeat.bind(this))
		.attr("title","Toggle repeat one");
	};

	//called each time a video is pushed throu socket
	PlaylistControllerIndex.prototype.videoPushed = function(videoId){
		var that = this,
			object = {
				id : videoId,
				callback : function(video){
					if (!that.checkIfExist(video)){
						that.generateResultDiv(video);	
						if (that.addNewToQue){
							this.Mediator.write("queueVideo", video);
						}
					}
					else{
						if (that.addNewToQue){
							this.Mediator.write("queueVideo", video);
						}		
					}	
				}			
			}
			
		this.Mediator.write("getVideoFromId", object);
	};

	//generates a template for a video element
	var generateTemplate = function(){
		var element 	= doc.createElement("div"),
			thumbDiv 	= doc.createElement("div"),
			subTitleDiv = doc.createElement("div"),
			queue 		= doc.createElement("button"),	
			hide 		= doc.createElement("button"),	
			title 		= doc.createElement("h3"),
			thumb 		= doc.createElement("img");

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


	//empty the queue
	PlaylistControllerIndex.prototype.emptyQueue = function(){
		this.Mediator.write("emptyQueue");
	};

	//back and forth between adding videos and playlist
	PlaylistControllerIndex.prototype.toggleAddVideo = function(){
		this.overlayed = !this.overlayed;
		if (!this.overlayed){
			this.overlayEl.attr("src", "");
			console.log("Iframe unloaded");
			$("#overlay-wrapper").toggle(400);	
			$("#main-sidebar").toggle();
    		$("#player").toggle();
    		this.overlayBEl.toggle(100);
    		$("body").toggleClass('no-scrolling');
		}
		else{
			if (this.overlayEl.attr("src")!==this.iframeSrc){
				this.overlayEl.attr("src", this.iframeSrc);
			}

			this.overlayEl.load(function(){
				console.log("Iframe loaded");	
			});	
			
			this.overlayEl.toggle(800);	
			$("#main-sidebar").toggle();
    		$("#player").toggle();
    		this.overlayBEl.toggle(100);
    		$("body").toggleClass('no-scrolling');	
		}
	};

	//returns the bool addNewToQue
	PlaylistControllerIndex.prototype.getAddNewToQue = function(){
		return this.addNewToQue;
	};
			
	//toggle addNewToQue (add pushed songs to queue)
	PlaylistControllerIndex.prototype.toggleAddNewToQue = function(){
		this.addNewToQue = !this.addNewToQue;
		$(this.addNewToQueEl).toggleClass("active");
		
		if (this.addNewToQue){
			this.Mediator.write("temporaryMessage", "New videos will now be added to the queue");
		}
		else {
			this.Mediator.write("temporaryMessage", "Add new to queue is now off");
		}

		//code for animations here
		return false;
	};


	//state changed on player, do something with ui
	var playerStateChange = function(object){
		this.isPlaying = object.newState===1;
		//-3 (previous pressed)
		//-2 (videos removed)
		//-1 (unstarted)
		//0 (ended)
		//1 (playing)
		//2 (paused)
		//3 (buffering)
		//5 (video cued)
		switch(object.newState)
		{
			case 0:
				this.Mediator.write("playNext");
				break;
			case 1:
				this.Mediator.write("permanentMessage", "Playing video " + object.current.title);
				$(this.playEl).addClass("active");
				break;
			case 2:
				this.Mediator.write("permanentMessage", "Video paused");
				$(this.playEl).removeClass("active");
				break;
			case 3:
				console.log("Video is buffering");
				break;
		}
	}

	//bound to playbutton
	PlaylistControllerIndex.prototype.play = function(){
		$(this.playEl).toggleClass("active");
		this.Mediator.write("play");
		return false;
	};

	//bound to nextbutton
	PlaylistControllerIndex.prototype.forward = function(){
		this.Mediator.write("playNext");
		return false;
	};

	//bound to previous button
	PlaylistControllerIndex.prototype.previous = function(){
		this.Mediator.write("playPrev");
		return false;
	};
	
	//bound to shuffle button
	PlaylistControllerIndex.prototype.toggleShuffle = function(){
		this.Mediator.write("toggleShuffle");
		$(this.shuffleEl).toggleClass("active");
		return false;
	};

	//bound to autoplay button (keep playing when list/queue is empty)
	PlaylistControllerIndex.prototype.toggleAutoplay = function(){
		this.Mediator.write("toggleAutoplay");
		$(this.autoplayEl).toggleClass("active");
		return false;
	};


	//bound to repeat button
	PlaylistControllerIndex.prototype.toggleRepeat = function(){
		this.Mediator.write("toggleRepeat");
		$(this.repeatEl).toggleClass("active");
		return false;
	};
	
	//creates a new video element and append it to the list
	PlaylistControllerIndex.prototype.generateResultDiv = function(video){
		var that = this;
		this.results.push(video);
		this.Mediator.write("resultsChange", this.results);
		
		var element = generateTemplate();
		
        $(element).find(".title")
		.html(video.title).on("click", function(){
			that.Mediator.write("play", video);	
		});
	
		//add action for queue
		$(element).find(".add-to-queue").on("click", function(){
			that.Mediator.write("queueVideo", video);
		});

		//add action for remove (hide)
		$(element).find(".hide-video").on("click", function(){
			$(element).hide(100);
		});

		//set properties of video element
		$(element).find(".thumb").attr("src", video.thumb);
		$("<h4></h4>").text(video.category).appendTo($(element).find(".subtitle"));
		$("<h4></h4>").text("Duration : " + video.duration).appendTo($(element).find(".subtitle"));
		$("<h4></h4>").text("Views : " + video.views).appendTo($(element).find(".subtitle"));
		$("<h4></h4>").text("Likes : " + video.likes).appendTo($(element).find(".subtitle"));
		$("<h4></h4>").text("Dislikes : " + video.dislikes).appendTo($(element).find(".subtitle"));
	
		video.element = element;
		this.resultEl.append(element);
		
		if (this.addNewToQue){
			this.Mediator.write("queueVideo", video);	
			if (!this.isPlaying){
				this.Mediator.write("playNext");
			}
		}
	};

	//check if a specific videoId exist in results array
	PlaylistControllerIndex.prototype.checkIfExist = function(video){
		var found = false;
		for (var i = 0; i < this.results.length; i++){
			if (video.id === this.results[i].id){
				found = true;
			};
		}
		return found;
	};

	//clears result and all the video-elements
	PlaylistControllerIndex.prototype.clear = function(){
		$(this.resultEl).empty();
		this.results = [];
		this.Mediator.write("resultsChange", this.results);
	};
	
	//remove the given video from the div and array
	var removeVideo = function(video){
		for(var i = this.results.length; i--;) {
			if (this.results[i].id === video.id) {
				this.Mediator.write("putTemporary", "Video has been removed");
				$(this.results[i].element).remove();
				this.results.splice(i, 1);
				this.Mediator.write("resultsChange", this.results);
			}
		}
	};
	
	//update results when it changes
	var resultsChange = function(results){
		this.results = results;
	};

})(window, document, jQuery);

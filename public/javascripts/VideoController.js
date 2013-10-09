(function(win, doc, $, undefined){
	"use strict";
	var BMAP = win.BMAP || {};

	var VideoController = function(template){
		this.templateEl     = template;
		this.resultEl       = $("#search-results");
		this.qContainerEl 	= $("#queue");
		this.pContainerEl 	= $("#previous");
		
		this.playEl 		= $("#play").on("click", this.play.bind(this)).attr("title",
			"Play or pause video"	
		);
		this.forwardEl 		= $("#next").on("click", this.forward.bind(this)).attr("title",
			"Play the next video"
		);
		this.previousEl		= $("#prev").on("click", this.previous.bind(this)).attr("title",
			"Play previous video"
		);
		this.shuffleEl		= $("#shuffle").on("click", this.toggleShuffle.bind(this)).attr("title",
			"Toggle shuffle"		
		);
		this.autoplayEl		= $("#autoplay").on("click", this.toggleAutoplay.bind(this)).attr("title",
			"Toggle autoplay, if autoplay is enabled player will keep playing when queue is empty"		
		);
		this.repeatEl		= $("#repeat").on("click", this.toggleRepeat.bind(this)).attr("title",
			"Toggle repeat one"				
		);

		this.shuffle = false;
		this.repeat  = false;
		this.autoplay = false;
		this.results = [];
	};	
	
	VideoController.prototype.play = function(){
		$(this.playEl).toggleClass("active");
		BMAP.YoutubePlayer.play();
		//code for animations go here
		return false;
	};

	VideoController.prototype.forward = function(){
		BMAP.YoutubePlayer.next();
		//code for animations go here
		return false;
	};

	//previous pressed
	VideoController.prototype.previous = function(){
		BMAP.YoutubePlayer.playPrev();
		//code for animantion goes here
		return false;
	};
	
	//toggle shuffle
	VideoController.prototype.toggleShuffle = function(){
		$(this.shuffleEl).toggleClass("active");
		this.shuffle = !this.shuffle;
		if (this.shuffle){
			BMAP.MessageBoard.putTemporary("Shuffle is now on");
		}
		else {
			BMAP.MessageBoard.putTemporary("Shuffle is now off");
		}
		//code for animations here
		return false;
	};

	//toggle autoplay (keep playing when list/queue is empty)
	VideoController.prototype.toggleAutoplay = function(){
		$(this.autoplayEl).toggleClass("active");
		this.autoplay = !this.autoplay;
		if (this.addNewToQue){
			BMAP.MessageBoard.putTemporary("Autoplay is now on");
		}
		else {
			BMAP.MessageBoard.putTemporary("Autoplay is now off");
		}
		//code for animations here
		return false;
	};


	//toggle repeat one
	VideoController.prototype.toggleRepeat = function(){
		$(this.repeatEl).toggleClass("active");
		this.repeat = !this.repeat;
		if (this.repeat){
			BMAP.MessageBoard.putTemporary("Repeat one is now on");
		}
		else {
			BMAP.MessageBoard.putTemporary("Repeat one is now off");
		}
		//code for animations goes here
		return false;
	};
	
	VideoController.prototype.drawThumbs = function(queue, previous){
		
		//code for animation thumbs goes here
	};
	
	//creates a new element to show the video
	VideoController.prototype.generateResultDiv = function(video){
		this.results.push(video);
		var element = $(this.templateEl).clone();
		
		element.attr("id", "");
        element.find(".title")
		.html(video.title)
		.on("click", function(){
			BMAP.YoutubePlayer.play(video);	
		});
		
        element.find(".duration").html(video.duration);
        element.find(".views").html(video.views);
        element.find(".category").html(video.category);

		//add action for +Q
		element.find(".add-to-queue").on("click", function(){
			BMAP.YoutubePlayer.queueVideo(video);
		});

		
		//add action for +P
        element.find(".add-to-playlist").on("click", function(){
			var videos = [];
			videos.push(video);
			BMAP.PlaylistHandler.push(videos);
		});

		if (!BMAP.PlaylistHandler || !BMAP.PlaylistHandler.isAttached()){
			element.find(".add-to-playlist").hide();
		};

		video.element = element;
		this.resultEl.append(element);
		
		if (this.addNewToQue){
			BMAP.YoutubePlayer.queueVideo(video);	
			if (BMAP.YoutubePlayer.isStopped()){
				BMAP.YoutubePlayer.next();
			}
		}
	};

	//called when queue is empty to get new video to play
	VideoController.prototype.onEmptyQueue = function(callback){
	var video;
		if (this.autoplay){
			if (this.shuffle){
				var r = Math.floor(Math.random()*this.results.length);
				video = this.results[r];
			}
			else{
				var index = this.results.indexOf(BMAP.YoutubePlayer.getCurrent());
				index ++;
				if (index >= this.results.length){	   
					index = 0;
				}
				while (!$(this.results[index].element).is(":visible")){
					index++;
					if (index >= this.results.length){	   
						index = 0;
					}
				}
				video = this.results[index];
			};

			//if the video element is hidden we want to generate a new one else we are done
			if($(video.element).is(':visible')) {
				callback(video);
			}
			else{
				this.onEmptyyQueue(callback);
			}
		}
	};

	//check if a specific videoId exist in results array
	VideoController.prototype.checkIfExist = function(video){
		var found = false;
		for (var i = 0; i < this.results.length; i++){
			console.log(this.results[i].id);
			if (video.id === this.results[i].id){
				found = true;
			};
		}
		return found;
	};

	//clears result and all the video-elements
	VideoController.prototype.clear = function(){
		$(this.resultEl).empty();
		this.results = [];
	};
	
	//remove the given video from the div and array
	VideoController.prototype.removeVideo = function(video){
		for(var i = this.results.length; i--;) {
			if (this.results[i].id === video.id) {
				BMAP.MessageBoard.putWarning("The video " + video.title + " could not be played and will be automaticly removed");	
				$(this.results[i].element).remove();
				this.results.splice(i, 1);	
			}
		}
	};

	VideoController.prototype.getResults = function(){
		return this.results;
	};

	//true if element is hidden
	VideoController.prototype.isHidden = function(video){
		 return ($(video.element).css("display") == 'none');
	};

	BMAP.VideoController = VideoController;
	win.BMAP = BMAP;
})(window, document, jQuery);

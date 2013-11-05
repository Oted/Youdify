(function(win, doc, $, undefined){
	"use strict";
	var BMAP = win.BMAP || {};

	var VideoController = function(template, resultEl){
		this.templateEl     = template;
		this.resultEl       = resultEl;
		this.qContainerEl 	= $("#queue");
		this.pContainerEl 	= $("#previous");

   		this.constraintEl   = $("#constraints").on("keyup", this.constrKeypress.bind(this));
		
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
		this.autoplay = true;
		this.results = [];
	};	

	//state changed on player, do something with ui
	VideoController.prototype.stateChange = function(event){
		var current = BMAP.YoutubePlayer.getCurrent()
		//-3 (previous pressed)
		//-2 (videos removed)
		//-1 (unstarted)
		//0 (ended)
		//1 (playing)
		//2 (paused)
		//3 (buffering)
		//5 (video cued)
		switch(event)
		{
			case 0:
				BMAP.YoutubePlayer.next();
				break;
			case 1:
				BMAP.MessageBoard.put("Playing video " + current.title);
				$(this.playEl).addClass("active");
				break;
			case 2:
				BMAP.MessageBoard.put("Video stopped");
				$(this.playEl).removeClass("active");
				break;
			case 3:
				console.log("Video is buffering");
				break;
		}
	}

	VideoController.prototype.play = function(){
		$(this.playEl).toggleClass("active");
		BMAP.YoutubePlayer.play();
		return false;
	};

	VideoController.prototype.forward = function(){
		BMAP.YoutubePlayer.next();
		return false;
	};

	//previous pressed
	VideoController.prototype.previous = function(){
		BMAP.YoutubePlayer.playPrev();
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
		return false;
	};

	//toggle autoplay (keep playing when list/queue is empty)
	VideoController.prototype.toggleAutoplay = function(){
		$(this.autoplayEl).toggleClass("active");
		this.autoplay = !this.autoplay;
		if (this.autoplay){
			BMAP.MessageBoard.putTemporary("Autoplay is now on");
		}
		else {
			BMAP.MessageBoard.putTemporary("Autoplay is now off");
		}
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
		.html(video.title).on("click", function(){
			BMAP.YoutubePlayer.play(video);	
		});
	
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
	
		//set properties of video element
		element.find(".thumb").attr("src", video.thumb);
		$("<h4></h4>").text(video.category).appendTo(element.find(".subtitle"));
		$("<h4></h4>").text("Duration : " + video.duration).appendTo(element.find(".subtitle"));
		$("<h4></h4>").text("Views : " + video.views).appendTo(element.find(".subtitle"));
		$("<h4></h4>").text("Likes : " + video.likes).appendTo(element.find(".subtitle"));
		$("<h4></h4>").text("Dislikes : " + video.dislikes).appendTo(element.find(".subtitle"));
	
		video.element = element;
		this.resultEl.append(element);
		
		if (BMAP.SharedFeatures && BMAP.SharedFeatures.getAddNewToQue()){
			BMAP.YoutubePlayer.queueVideo(video);	
			if (!BMAP.YoutubePlayer.isPlaying()){
				BMAP.YoutubePlayer.next();
			}
		}
	};

	//called when queue is empty to get new video to play
	VideoController.prototype.onEmptyQueue = function(previous10,callback){
		var video, r, count = 0;
		if (this.autoplay){
			if (this.shuffle){
				//try to avoid playing previous videos
				do {
					r = Math.floor(Math.random()*this.results.length),
					video = this.results[r];
					count += 1;
					console.log(count);
				} while(count<10 && (previous10.indexOf(video)!=-1));
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
				this.onEmptyQueue(previous10,callback);
			}
		}
	};

	//check if a specific videoId exist in results array
	VideoController.prototype.checkIfExist = function(video){
		var found = false;
		for (var i = 0; i < this.results.length; i++){
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

	//returns if repeating
	VideoController.prototype.getRepeat = function(){
		return this.repeat;
	};

	//triggers when constraints keyup
	VideoController.prototype.constrKeypress = function(event){
		var results = BMAP.VideoController.getResults();
		var key = event.which;
		var backspace = key == 8;
		var constraints = this.constraintEl.val().split(",");
		var constraint = constraints[constraints.length - 1];
			
		if (constraint.length == 0 && constraints.length ==0){
			$(".video").show();
			return;
		}

		//triggers when we are inbetween two keywords
		if (constraint.length == 0){
			//input box is empty
			if (constraints.length <= 1){
				results.forEach(function(video){
					if (BMAP.VideoController.isHidden(video)){
						video.element.show();
					}
				});
				return;
			}
			else{
				backspace = true;
			}
		}

		if (constraint.indexOf("-")==0){
			constraint = constraint.replace("-","");
				if(constraint.length!==0){
					results.forEach(function(video){
						if (video.title.toLowerCase().indexOf(constraint) !== -1){
							video.element.hide();
						}else if (backspace){
							video.element.show();
						}
					});
				}
		}
		else {
			constraint = constraint.replace("+","");
			if(constraint.length!==0){
				results.forEach(function(video){
					if (video.title.toLowerCase().indexOf(constraint) == -1){
						video.element.hide();
					}else if (backspace){
						video.element.show();
					}
				});
			}
		}
	};


	BMAP.VideoController = VideoController;
	win.BMAP = BMAP;
})(window, document, jQuery);

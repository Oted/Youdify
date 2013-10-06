(function(win, doc, $, undefined){
	"use strict";
	var BMAP = win.BMAP || {};

	var VideoController = function(template){
		this.templateEl     = template;
		this.resultEl       = $("#search-results");
		this.qContainerEl 	= $("#queue");
		this.pContainerEl 	= $("#previous");
		
		this.forwardEl 		= $("#next").on("click", this.forward.bind(this));
		this.previousEl		= $("#prev").on("click", this.previous.bind(this));
		this.shuffleEl		= $("#shuffle").on("click", this.toggleShuffle.bind(this));
		this.addNewToQueEl	= $("#addNewToQue").on("click", this.toggleAddNewToQue.bind(this));
		this.addNewToQueEl	= $("#autoplay").on("click", this.toggleAutoplay.bind(this));
		this.repeatEl		= $("#repeat").on("click", this.toggleRepeat.bind(this));
		
		this.shuffle = false;
		this.repeat  = false;
		this.addNewToQue = false;
		this.autoplay = false;
		this.results = [];
	};

	VideoController.prototype.forward = function(){
		BMAP.YoutubePlayer.next();
		//code for animations go here
	};

	//previous pressed
	VideoController.prototype.previous = function(){
		BMAP.YoutubePlayer.playPrev();
		//code for animantion goes here
	};
	
	//toggle shuffle
	VideoController.prototype.toggleShuffle = function(){
		this.shuffle = !this.shuffle;
		if (this.shuffle){
			BMAP.MessageBoard.putTemporary("Shuffle is now on");
		}
		else {
			BMAP.MessageBoard.putTemporary("Shuffle is now off");
		}
		//code for animations here
	};

	//toggle addNewToQue (add pushed songs to queue)
	VideoController.prototype.toggleAddNewToQue = function(){
		this.addNewToQue = !this.addNewToQue;
		if (this.addNewToQue){
			BMAP.MessageBoard.putTemporary("Add new to queue is now on");
		}
		else {
			BMAP.MessageBoard.putTemporary("Add new to queue is now off");
		}
		//code for animations here
	};
	
	//toggle autoplay (keep playing when list/queue is empty)
	VideoController.prototype.toggleAutoplay = function(){
		this.autoplay = !this.autoplay;
		if (this.addNewToQue){
			BMAP.MessageBoard.putTemporary("Autoplay is now on");
		}
		else {
			BMAP.MessageBoard.putTemporary("Autoplay is now off");
		}
		//code for animations here
	};


	//toggle repeat one
	VideoController.prototype.toggleRepeat = function(){
		this.repeat = !this.repeat;
		if (this.repeat){
			BMAP.MessageBoard.putTemporary("Repeat one is now on");
		}
		else {
			BMAP.MessageBoard.putTemporary("Repeat one is now off");
		}
		//code for animations goes here
	};
	
	VideoController.prototype.drawThumbs = function(queue, previous){
		
		//code for animation thumbs goes here
	};
	
	//creates a new element to show the video
	VideoController.prototype.generateResultDiv = function(video){
		this.results.push(video);
		var element = $(this.templateEl).clone();
		
		console.log(this.results);

		element.attr("id", "");
        element.find(".title")
		.html(video.title)
		.on("click", function(){
			BMAP.YoutubePlayer.play(video);	
		});
    	
		//add action for +Q
		element.find(".add-to-queue").on("click", function(){
			BMAP.YoutubePlayer.queueVideo(video);
		});

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

	//check if a specific videoId exisat in results array
	VideoController.prototype.checkIfExist = function(videoId){
		var found = false;
		console.log(videoId);
		for (var i = 0; i < this.results.length; i++){
			console.log(this.results[i].id);
			if (videoId === this.results[i].id){
				found = true;
			};
		}
		return found;
	};

	BMAP.VideoController = VideoController;
	win.BMAP = BMAP;
})(window, document, jQuery);

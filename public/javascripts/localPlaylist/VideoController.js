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
		this.autoplayEl		= $("#autoplay").on("click", this.toggleAutoplay.bind(this));
		this.repeatEl		= $("#repeat").on("click", this.toggleRepeat.bind(this));
		this.searchEl       = $("#search").on("keypress", this.searchKeypress.bind(this));
    	this.constraintEl   = $("#constraints").on("keyup", this.constrKeypress.bind(this));
		
		this.shuffle = false;
		this.repeat  = false;
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

	//toggle autoplay (keep playing when list/queue is empty)
	VideoController.prototype.toggleAutoplay = function(){
		this.autoplay = !this.autoplay;
		if (this.autoplay){
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

	//triggers when enter is pressed in searchEl
	VideoController.prototype.searchKeypress = function(event){
		if (event.which == 13) {
			this.clear();
			var that = this;
			var query = this.searchEl.val();
			
			//if radiobutton is on playlist, the search searches for playlists
			if (false){
				BMAP.MessageBoard.putTemporary("Searching for playlists with " + query);
				BMAP.SearchMachine.loadPlaylists(query,function(playlists){
					BMAP.SearchMachine.getVideosFromPlaylists(playlists, function(video){
						for (var i=0; i < that.results.length; i++){
							var found = false;
							if (that.results[i].id === video.id){
								found=true;
								break;
							}
						}
					
						if (!found && video.title!=="Private video"){
							that.results.push(video);
							that.generateResultDiv(video);
						}
					});	
				});
			}

			//if radiobutton is on videos we do a normal search
			else{
				BMAP.SearchMachine.loadVideos(query,function(video){
					for (var i=0; i < that.results.length; i++){
							var found = false;
							if (that.results[i].id === video.id){
								found=true;
								break;
							}
						}
					
						if (!found && video.title!=="Private video"){
							that.results.push(video);
							that.generateResultDiv(video);
						}
		
				});
			}
		};
	};
	
	//creates a new element to show the video
	VideoController.prototype.generateResultDiv = function(video){
		var element = $(this.templateEl).clone();

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

		//add action for +P
        element.find(".add-to-playlist").on("click", function(){
			var videos = [];
			videos.push(video);
			BMAP.PlaylistHandler.push(videos);
		});

		if (!BMAP.PlaylistHandler.isAttached()){
			element.find(".add-to-playlist").hide();
		}

       
		video.element = element;
		this.resultEl.append(element);
	};

	//clears result and all the video-elements
	VideoController.prototype.clear = function(){
		$(this.resultEl).empty();
		this.results = [];
	};
	
	//triggers when constraints keyup
	VideoController.prototype.constrKeypress = function(event){
		var that = this; 
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
				this.results.forEach(function(video){
					if (that.isHidden(video)){
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
					this.results.forEach(function(video){
						if (video.title.toLowerCase().indexOf(constraint) !== -1){
							video.element.hide();
						}else if (backspace){
							video.element.show();
						}
					});
				}
		}
		else if (constraint.indexOf("+")==0){
			constraint = constraint.replace("+","");
			if(constraint.length!==0){
				this.results.forEach(function(video){
					if (video.title.toLowerCase().indexOf(constraint) == -1){
						video.element.hide();
					}else if (backspace){
						video.element.show();
					}
				});
			}
		}
		else if (constraint.indexOf("#")==0){
			constraint = constraint.replace("#","");
			if(constraint.length!==0){
				this.results.forEach(function(video){
					if (video.playlist.pTitle.toLowerCase().indexOf(constraint) == -1){
						video.element.hide();
					}else if (backspace){
						video.element.show();
					}
				});
			}
		}
	};

	//true if element is hidden
	VideoController.prototype.isHidden = function(video){
		 return ($(video.element).css("display") == 'none');
	};

	//called when que is empty to get new video to play
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
		else{
			BMAP.MessageBoard.putTemporary("Autoplay disabled, video stop");
			BMAP.YoutubePlayer.stop();
		};
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

	BMAP.VideoController = VideoController;
	win.BMAP = BMAP;
})(window, document, jQuery);

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
		this.shuffleEl		= $("#shuffle").on("click", this.toggleShuffle.bind(this))
		this.repeatEl		= $("#repeat").on("click", this.toggleRepeat.bind(this))
		this.searchEl       = $("#search").on("keypress", this.searchKeypress.bind(this));
    	this.constraintEl   = $("#constraints").on("keyup", this.constrKeypress.bind(this));
		
		this.shuffle = false;
		this.repeat  = false;
		this.results = [];
	};

	VideoController.prototype.forward = function(){
		BMAP.YoutubePlayer.next();
		//code for animations go here
	};

	VideoController.prototype.previous = function(){
		BMAP.YoutubePlayer.playPrev();
		//code for animantion goes here
	};
	
	VideoController.prototype.toggleShuffle = function(){
		this.shuffle = !this.shuffle;
		if (shuffle){
			BMAP.MessageBoard.putTemporary("Shuffle is now on");
		}
		else {
			BMAP.MessageBoard.putTemporary("Shuffle is now off");
		}
		//code for animations here
	};
	
	VideoController.prototype.toggleRepeat = function(){
		this.repeat = !this.repeat;
		if (repeat){
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

	//Triggers when enter is pressed in searchEl
	VideoController.prototype.searchKeypress = function(event){
		if (event.which == 13) {
			this.clear();
			var that = this;
			var query = this.searchEl.val();

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

	
	VideoController.prototype.clear = function(){
		$(this.resultEl).empty();
		this.results = [];
	};
	
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
	};

	BMAP.VideoController = VideoController;
	win.BMAP = BMAP;
})(window, document, jQuery);

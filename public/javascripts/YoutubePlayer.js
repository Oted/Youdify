(function(win, doc, $, undefined){
	"use stict";
	var BMAP = win.BMAP || {};

	var YoutubePlayer = function(width, height){		
		this.width = width;
		this.height = height;
		this.player = undefined;

		this.current = undefined;
		this.queue = [];
		this.previous = [];
		
		this.loadPlayer();
	};
	
	//load the player into player div
	YoutubePlayer.prototype.loadPlayer = function(){
		console.log("Creating player with height " + this.height + " and width " + this.width);
		
		var that = this;	
		var tag = doc.createElement("script");
		tag.src = "http://www.youtube.com/iframe_api";
		var firstScriptTag = doc.getElementsByTagName('script')[0];
		firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);	
		
		var player;
		win.onYouTubeIframeAPIReady = function() {
			that.player = player = new YT.Player('player', {
				height: that.height,
				width: that.width,
				allowfullscreen: 'true',
				events: {
				  	"onReady": function(){
						BMAP.MessageBoard.putTemporary("Player is now ready");
					},
					"onStateChange": function(event){
						that.onPlayerStateChange(event);
					},
					"onError": function(event){
						that.onPlayerError(event);
					}
				}
			});
		};
	};
	
	//called on any statechange that occurs
	YoutubePlayer.prototype.onPlayerStateChange = function(event){
		BMAP.VideoController.stateChange(event.data);
	};
	
	//called when error in da player
	YoutubePlayer.prototype.onPlayerError = function(error){
		var code = error.data
		if (code == 101 || code == 150 || code == 100 || code == 0){
			BMAP.VideoController.removeVideo(this.current);
			this.next();
		}				
	};

	//toggle play video
	YoutubePlayer.prototype.play = function(video){
		if (video){
			this.player.loadVideoById(video.id, 0, "large");	
			this.setCurrent(video);
		}
		else {
			if (this.isPlaying()){
				this.pause();
			}else{
				this.player.playVideo();
			}
		}
	};

	//pause video
	YoutubePlayer.prototype.pause = function(){
		this.player.pauseVideo();
	};
	
	//stop video
	YoutubePlayer.prototype.stop = function(){
		this.player.stopVideo();
	};

	//called to play next song
	YoutubePlayer.prototype.next = function(){
		var nextVideo = undefined;
		var that = this;	
		//if there is something queued
		if (BMAP.VideoController.getRepeat()){
			this.play(this.current);
		}
		else{
			if (this.queue.length > 0){
				nextVideo = this.queue.shift();
				this.play(nextVideo);
			}
			else{
				nextVideo = BMAP.VideoController.onEmptyQueue(this.previous,function(video){
					that.play(video);		
				});
			}
		}
	};

	//plays previous element in previous
	YoutubePlayer.prototype.playPrev = function(){
		var prevVideo = undefined;
		
		//if there are any previous
		if (this.previous.length > 0){
			prevVideo = this.previous.shift();
			this.play(prevVideo);
		};
	};

	//add videos to queue
	YoutubePlayer.prototype.queueVideo = function(video){
		this.queue.push(video);
		BMAP.MessageBoard.putTemporary(video.title + " queued");
		BMAP.VideoController.drawThumbs(this.queue,this.previous);
	};
	
	//sets current to parameter video
	YoutubePlayer.prototype.setCurrent = function(video){
		this.current = video;
		this.previous.unshift(this.current);   
	};

	//returns current
	YoutubePlayer.prototype.getCurrent = function(){
		return this.current;
	};
	
	//returns true if the player is playing
	YoutubePlayer.prototype.isPlaying = function(){
		if (this.player.getPlayerState()){
			return this.player.getPlayerState()===1;
		}
		else{
			return false;
		}
	};

	//empty the queue
	YoutubePlayer.prototype.emptyQueue = function(){
		this.queue = [];
		BMAP.MessageBoard.putTemporary("Queue is now empty");
	};

	BMAP.YoutubePlayer = YoutubePlayer; 
	win.BMAP = BMAP;
}(window, document, jQuery));

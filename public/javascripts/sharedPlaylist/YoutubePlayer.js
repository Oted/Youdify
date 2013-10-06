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
				videoId: 'M7lc1UVf-VE',
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
		//-3 (previous pressed)
		//-2 (videos removed)
		//-1 (unstarted)
		//0 (ended)
		//1 (playing)
		//2 (paused)
		//3 (buffering)
		//5 (video cued)
		switch(event.data)
		{
			case 0:
				this.next();
				break;
			case 1:
				BMAP.MessageBoard.put("Playing video " + this.current.title);
				break;
			case 2:
				BMAP.MessageBoard.put("Video stopped");
				break;
			case 3:
				console.log("Video is buffering");
				break;
		}
	};
	
	//called when error in da player
	YoutubePlayer.prototype.onPlayerError = function(error){
		var code = error.data
		if (code == 101 || code == 150 || code == 100 || code == 0){
			console.log("Error : " + code);	
		}				
	};

	//play video
	YoutubePlayer.prototype.play = function(video){
		if (video){
			this.player.loadVideoById(video.id, 0, "large");	
			this.setCurrent(video);
		}
		else {
			this.stop();
		}
	};

	//pause video
	YoutubePlayer.prototype.pause = function(){
		this.player.pauseVideo();
	};
	
	//stop video
	YoutubePlayer.prototype.stop = function(){
		this.player.stopvideo();
	};

	//true if the player isnt playing
	YoutubePlayer.prototype.isStopped = function(){
		var st = this.player.getPlayerState();
		return (st===2 || st===0 || st===-1);
	};

	//called to play next song
	YoutubePlayer.prototype.next = function(){
		var nextVideo = undefined;
		var that = this;	
		//if there is something queued
		if (this.queue.length > 0){
			nextVideo = this.queue.shift();
			this.play(nextVideo);
		}
		else{
			nextVideo = BMAP.VideoController.onEmptyQueue(function(video){
				that.play(video);		
			});
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
		this.previous.push(this.current);
		this.current = video;
	};

	//returns current
	YoutubePlayer.prototype.getCurrent = function(){
		return this.current;
	};

	BMAP.YoutubePlayer = YoutubePlayer; 
	win.BMAP = BMAP;
}(window, document, jQuery));

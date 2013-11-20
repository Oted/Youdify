(function(win, doc, undefined){
	"use stict";
	var BMAP = win.BMAP || {};

	var YoutubePlayer = function(width, height){		
		this.width = width;
		this.height = height;
		this.player = undefined;
		this.loadPlayer();
	
		BMAP.Mediator.subscribe("emptyQueue", emptyQueue.bind(this));
		BMAP.Mediator.subscribe("play", this.play.bind(this));
		BMAP.Mediator.subscribe("playNext", this.playNext.bind(this));
		BMAP.Mediator.subscribe("playPrev", playPrev.bind(this));
		BMAP.Mediator.subscribe("queueVideo", queueVideo.bind(this));
		
		BMAP.Mediator.subscribe("toggleShuffle", toggleShuffle.bind(this));
		BMAP.Mediator.subscribe("toggleRepeat", toggleRepeat.bind(this));
		BMAP.Mediator.subscribe("toggleAutoplay", toggleAutoplay.bind(this));
		BMAP.Mediator.subscribe("resultsChange", resultsChange.bind(this));
		
		this.current = undefined;
		this.queue = [];
		this.previous = [];
		this.shuffle		= false;
		this.repeat  		= false;
		this.autoplay		= true;
		this.results		= [];
	};

	//called to play next song
	YoutubePlayer.prototype.playNext = function(){
		var nextVideo = undefined,
			that = this;	
		
		//if there is something queued
		if (this.repeat){
			this.play(this.current);
		}
		else{
			if (this.queue.length > 0){
				nextVideo = this.queue.shift();
				this.play(nextVideo);
			}
			else{
				this.onEmptyQueue(0, this.previous,function(video){
					that.play(video);		
				});
			}
		}
	};

	//plays previous element in previous
	var playPrev = function(){
		var prevVideo = undefined;
		console.log(this.previous);	
		
		//if there are any previous
		if (this.previous.length > 0){
			this.previous.shift();
			prevVideo = this.previous.shift();

			this.play(prevVideo);
		};
	};

	var toggleShuffle = function(){
		this.shuffle = !this.shuffle;
		if (this.shuffle) 
			BMAP.Mediator.write("temporaryMessage", "Shuffle is now on");
		else 
			BMAP.Mediator.write("temporaryMessage", "Shuffle is now off");
	};

	var toggleRepeat = function(){
		this.repeat = !this.repeat;
		if (this.repeat) 
			BMAP.Mediator.write("temporaryMessage", "Repeat is now on");
		else 
			BMAP.Mediator.write("temporaryMessage", "Repeat is now off");
	};
	
	var toggleAutoplay = function(){
		this.autoplay = !this.autoplay;
		if (this.autoplay) 
			BMAP.Mediator.write("temporaryMessage", "Autoplay is now on");
		else 
			BMAP.Mediator.write("temporaryMessage", "Autoplay is now off");
	};
	
	//load the player into player div
	YoutubePlayer.prototype.loadPlayer = function(){
		var that = this,
			tag = doc.createElement("script"),
			firstScriptTag = doc.getElementsByTagName('script')[0],
			player;
		
		firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);	
		tag.src = "http://www.youtube.com/iframe_api";
		win.onYouTubeIframeAPIReady = function() {
			that.player = player = new YT.Player('player', {
				height: that.height,
				width: that.width,
				allowfullscreen: 'true',
				events: {
				  	"onReady": function(){
						BMAP.Mediator.write("permanentMessage", "Player is ready");
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
		var object = {
			current 	: this.current,
			newState 	: event.data
		}
		
		BMAP.Mediator.write("playerStateChange", object);
	};
	
	//called when error in da player
	YoutubePlayer.prototype.onPlayerError = function(error){
		var code = error.data,
			video = this.current;
		
		if (code == 101 || code == 150 || code == 100 || code == 0){
			this.playNext();
			BMAP.Mediator.write("removeVideo", video); 	
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

	//add videos to queue
	var queueVideo = function(video){
		if(this.queue.indexOf(video)===-1){
			this.queue.push(video);
			BMAP.Mediator.write("temporaryMessage", video.title + " queued");
			BMAP.Mediator.write("queueChange", this.queue);
		}
		else{
			BMAP.Mediator.write("temporaryMessage", video.title + " is already in the queue");
		}
	};
	
	//sets current to parameter video
	YoutubePlayer.prototype.setCurrent = function(video){
		this.current = video;
		this.previous.unshift(this.current);   
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

	//called when queue is empty to get new video to play
	YoutubePlayer.prototype.onEmptyQueue = function(iterationLimit, previous,callback){
		if (iterationLimit > 100){
			BMAP.Mediator.write("alertMessage", "Something went terrably wrong :(");
			return;
		}
		var video, randomVariable, 
			count = 0, 
			index, 
			prev = previous.slice(0,this.results.length-1);
		
		if (this.autoplay){
			if (this.shuffle){
				//try to avoid playing previous videos
				do {
					randomVariable = Math.floor(Math.random()*this.results.length),
					video = this.results[randomVariable];
					count += 1;
				} while(count<10 && (prev.indexOf(video)!==-1));
			}
			else{
				index = this.results.indexOf(this.current);
				index ++;
				if (index >= this.results.length){	   
					index = 0;
				}
				while (this.results[index].element.style.display === "none"){
					index++;
					iterationLimit ++;
					
					if (iterationLimit > 100){
						BMAP.Mediator.write("alertMessage", "Something went terrably wrong :(");
						break;
					}

					if (index >= this.results.length){	   
						index = 0;
					}
				}
				video = this.results[index];
			};

			//if the video element is hidden we want to generate a new one else we are done
			console.log(video.element.style.display);
			if(video.element.style.display !== "none") {
				callback(video);
			}
			else{
				this.onEmptyQueue(iterationLimit++, prev.slice(0,prev.length-1),callback);
			}
		}
	};

	//update results when it changes
	var resultsChange = function(results){
		console.log("Results has changed");
		this.results = results;
	};

	//empty the queue
	var emptyQueue = function(){
		this.queue = [];
		BMAP.Mediator.write("temporaryMessage", "Queue is now empty");
	};

	BMAP.YoutubePlayer = YoutubePlayer; 
	win.BMAP = BMAP;
}(window, document));

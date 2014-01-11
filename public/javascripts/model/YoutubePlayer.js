(function(win, doc, undefined){
	"use strict";

	//constructor of YotubePlayer
	var YoutubePlayer = function(Mediator, width, height){		
		this.Mediator 		= Mediator;
		this.width 			= width;
		this.height 		= height;
		this.player 		= undefined;
		this.loadPlayer();
	
		this.Mediator.subscribe("emptyQueue", emptyQueue.bind(this));
		this.Mediator.subscribe("play", this.play.bind(this));
		this.Mediator.subscribe("playNext", this.playNext.bind(this));
		this.Mediator.subscribe("playPrev", playPrev.bind(this));

		this.Mediator.subscribe("queueVideoFirst", this.queueVideoFirst.bind(this));
		this.Mediator.subscribe("queueVideoLast", this.queueVideoLast.bind(this));
		this.Mediator.subscribe("removeVideoFromQueue", removeVideoFromQueue.bind(this));
		
		this.Mediator.subscribe("toggleShuffle", toggleShuffle.bind(this));
		this.Mediator.subscribe("toggleRepeat", toggleRepeat.bind(this));
		this.Mediator.subscribe("toggleAutoplay", toggleAutoplay.bind(this));
		this.Mediator.subscribe("resultsChange", resultsChange.bind(this));
		
		this.current 		= undefined;
		this.queue 			= [];
		this.previous		= [];
		this.shuffle		= false;
		this.repeat  		= false;
		this.autoplay		= true;
		this.results		= [];
	};

	//remove a specific video from the queue
	var removeVideoFromQueue = function(video){
		console.log(video.title);
		var index = this.queue.indexOf(video);
		if (index >= 0){
			this.queue.splice(index,1);
			this.Mediator.write("queueChanged", this.queue);
		}
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
				this.Mediator.write("queueChanged", this.queue);
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
			this.Mediator.write("temporaryMessage", "Shuffle is now on");
		else 
			this.Mediator.write("temporaryMessage", "Shuffle is now off");
	};

	var toggleRepeat = function(){
		this.repeat = !this.repeat;
		if (this.repeat) 
			this.Mediator.write("temporaryMessage", "Repeat is now on");
		else 
			this.Mediator.write("temporaryMessage", "Repeat is now off");
	};
	
	var toggleAutoplay = function(){
		this.autoplay = !this.autoplay;
		if (this.autoplay) 
			this.Mediator.write("temporaryMessage", "Autoplay is now on");
		else 
			this.Mediator.write("temporaryMessage", "Autoplay is now off");
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
				playerVars: { 
					"showinfo" : 0,
					"controls" : 1,
					"iv_load_policy" : 3,
					"modestbranding" : 0,
					"rel" : 0
				},
				events: {
				  	"onReady": function(){
						that.Mediator.write("permanentMessage", "Player is ready");
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
		
		this.Mediator.write("playerStateChange", object);
	};
	
	//called when error in da player
	YoutubePlayer.prototype.onPlayerError = function(error){
		var code = error.data,
			video = this.current;
		
		if (code == 101 || code == 150 || code == 100 || code == 0){
			this.playNext();
			console.log("Error code : " + code);
			this.Mediator.write("removeVideo", video); 	
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
				if (this.current){
					this.player.playVideo();
				}
				else{
					this.playNext();
				}
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

	//add videos last to queue
	YoutubePlayer.prototype.queueVideoLast = function(video){
		if(this.queue.indexOf(video)===-1){
			this.queue.push(video);
			this.Mediator.write("temporaryMessage", video.title + " queued last");
			this.Mediator.write("queueChanged", this.queue);
			if (!this.autoplay && this.queue.length==1 && !this.isPlaying()){
				this.playNext();
			}
		}
		else{
			this.Mediator.write("temporaryMessage", video.title + " is already in the queue");
		}
	};
	
	//add videos first to queue
	YoutubePlayer.prototype.queueVideoFirst = function(video){
		if(this.queue.indexOf(video)===-1){
			this.queue.unshift(video);
			this.Mediator.write("temporaryMessage", video.title + " queued first");
			this.Mediator.write("queueChanged", this.queue);
			if (!this.autoplay && this.queue.length==1 && !this.isPlaying()){
				this.playNext();
			}
		}
		else{
			this.Mediator.write("temporaryMessage", video.title + " is already in the queue");
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
			this.Mediator.write("alertMessage", "Something went terrably wrong :(");
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
				console.log(this.results[index]);
				while (this.results[index].element.style.display === "none"){
					index++;
					iterationLimit ++;
					
					if (iterationLimit > 100){
						this.Mediator.write("alertMessage", "Something went terrably wrong :(");
						break;
					}

					if (index >= this.results.length){	   
						index = 0;
					}
				}
				video = this.results[index];
			};

			//if the video element is hidden we want to generate a new one else we are done
			if (video.element.style.display !== "none") {
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
		this.Mediator.write("temporaryMessage", "Queue is now empty");
		this.Mediator.write("queueChanged", this.queue);
	};

	exports.YoutubePlayer = YoutubePlayer;
}(window, document));

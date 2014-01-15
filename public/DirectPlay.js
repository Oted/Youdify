;(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
(function(){
  "use strict";
  var Mediator = function(){
    var subscribers = {},

      subscribe = function (event, callback) {
		if (typeof subscribers[event] === "undefined") {
          subscribers[event] = [];
        }

        subscribers[event].push(callback);
      },

      write = function (event, object) {
	  	var i = 0,
        	events = subscribers[event],
        	current;

        if (typeof events !== "undefined") {
          for (i = events.length; i >= 0; i--) {
            current = events[i];
            if (typeof current === "function") {
              current(object);
            }
          }
        }
	  };

      return {
        subscribe: subscribe,
        write: write
      };
  };
  
  exports.Mediator = new Mediator();
}(window));

},{}],2:[function(require,module,exports){
(function(win, doc, $, undefined){
    "use strict";
	
	//the first to run when document is ready
    $(function(){
		//stupid firefox bug
		$("#main-sidebar").toggle().toggle();
		
		//Create new AddVideoController
		new DirectPlayControllerIndex();			
	});

	//constroctor for this controller
	var DirectPlayControllerIndex = function(){
		this.Mediator 		= require("../Mediator.js").Mediator;
		
		var YoutubePlayer	= require("../model/YoutubePlayer.js").YoutubePlayer;	
		new YoutubePlayer(this.Mediator, 280, 200);
		
		var SearchMachine 	= require("../model/SearchMachine.js").SearchMachine;
		new SearchMachine(this.Mediator);

		this.Mediator.subscribe("resultsChange", resultsChange.bind(this));
		this.results 		= [];

		this.Mediator.subscribe("playerStateChange", playerStateChange.bind(this));
		this.Mediator.subscribe("resultsChange", resultsChange.bind(this));
		this.Mediator.subscribe("queueChanged", this.queueChanged.bind(this));
	
		this.initUI();
	};

	//bind and set attr on UI controls
	DirectPlayControllerIndex.prototype.initUI = function(){
		var that = this;
		this.resultEl       = $("#video-list");
		this.queueToggleEl 		= $("#queue-toggle");

		this.searchEl       = $("#search")
		.on("keypress", this.searchKeypress.bind(this));
   		
		this.constraintEl   = $("#constraints")
		.on("keyup", this.constrKeypress.bind(this))
		.attr("title","By typing here you sort out what is shown in the list");
		
		this.searchOptionEl = $("#search-option")
		.attr("title","Video search is the standard search, playlistsearch is better when searcrching for albums or collections of videos");
		
		$("#sort-category-1")
		.on("click", function(){
			that.sortOnCategory(1);
		});

		$("#sort-category-2")
		.on("click", function(){
			that.sortOnCategory(2);
		});

		$("#sort-category-3")
		.on("click", function(){
			that.sortOnCategory(3);
		});

		$("#home").attr("href", "http://" + doc.domain);
		
		$("#empty-queue")
		.on("click", function(){
			that.Mediator.write("emptyQueue");
		})
		.attr("title","Empty the queue");
		
		$("#next")
		.on("click", this.forward.bind(this))
		.attr("title","Play the next video");
		
		$("#prev")
		.on("click", this.previous.bind(this))
		.attr("title","Play previous video");

		$("#show-queue")
		.on("click", this.showQueue.bind(this));

		this.playEl 		= $("#play")
		.on("click", this.play.bind(this))
		.attr("title","Play or pause video");

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
	
	//sort the results
	DirectPlayControllerIndex.prototype.sortOnCategory = function(category){	
		var tempArr = this.results;
		if (category===1){
			tempArr.sort(
				function(a,b){
						return b.views-a.views;
				}
			);
		} else if (category===2){
			tempArr.sort(
				function(a,b){
						return b.durationSec - a.durationSec;
				}
			);
		} else if (category===3){
			tempArr.sort(
				function(a,b){
						return b.average - a.average;
				}
			);
		};

		this.clear();
		for (var i = 0; i < tempArr.length; ++i){
			this.generateResultDiv(tempArr[i]);
		}
	};

	//creates a new video element and append it to the list
	DirectPlayControllerIndex.prototype.generateResultDiv = function(video){
		var that = this;

		this.results.push(video);
		this.Mediator.write("resultsChange", this.results);
		
		var element = $("#video-tempelate").clone().show().attr("id","")[0];

        $(element).find(".title")
		.html(video.title).on("click", function(){
			that.Mediator.write("play", video);	
		});
	
		//add action for queue last
		$(element).find(".add-last-to-queue").on("click", function(){
			that.Mediator.write("queueVideoLast", video);
			$(this.parentNode).hide(200);
		});
		
		$(element).find(".toggle-video-options")
		.on("click", function(){
			$(element).find(".video-options").toggle(200);		
		});

		//add action for queue first
		$(element).find(".add-first-to-queue").on("click", function(){
			that.Mediator.write("queueVideoFirst", video);
			$(this.parentNode).hide(200);
		});

		//add action for remove (hide/remove)
		$(element).find(".hide-video").on("click", function(){
			var obj = {
				"id":video.id,
				"name":that.playlistName
			}
			if (isAuthenticated){
				that.Mediator.write("deleteVideo", obj);
				$(element).hide(100);
			}
			else{
				$(element).hide(100);
			}
		});

		//set properties of video element
		$(element).find(".thumb").attr("src", video.thumb);
		$("<h4></h4>").text(video.category).appendTo($(element).find(".subtitle"));
		$("<h4></h4>").text("Duration : " + video.duration).appendTo($(element).find(".subtitle"));
		$("<h4></h4>").text("Views : " + video.views).appendTo($(element).find(".subtitle"));
		$("<h4></h4>").text("Likes : " + video.likes).appendTo($(element).find(".subtitle"));
		$("<h4></h4>").text("Dislikes : " + video.dislikes).appendTo($(element).find(".subtitle"));

		//generates a preview element shown in "show queue etc"
		var preview 	= doc.createElement("div"),
			prevThumb	= $(element).find(".thumb").clone(),
			prevTitle 	= doc.createElement("h4"),
			title		= video.title,
			remove 		= doc.createElement("a");
		
		if (title.length >= 15){
			title = title.slice(0,12);
			title += "...";
		}

		$(preview).addClass("grid-1 preview");

		$(remove)
		.addClass("remove fontawesome-remove")
		.appendTo(preview);

		$(preview).on("click", function(){
			that.Mediator.write("removeVideoFromQueue", video);
		});

		$(prevThumb)
		.appendTo(preview);
	
		$(prevTitle).html(title)
		.addClass("subtitle")
		.appendTo(preview);

		video.preview = preview;
		video.element = element;
		this.resultEl.append(element);
	};

	//triggers when enter is pressed in searchEl
	DirectPlayControllerIndex.prototype.searchKeypress = function(event){
		var query = this.searchEl.val(),
			that = this,
			object ={
				query : query, 
				callback : function(video){ 
					var found = that.checkIfExist(video);
					if (!found && video.title!=="Private video"){
						that.generateResultDiv(video);
					}
				}
			}

		if (event.which == 13) {
			this.clear();

			//if radiobutton is on playlist, the search searches for playlists
			if (!this.searchOptionEl.is(":checked")){
				this.Mediator.write("loadPlaylists", object);
			}

			//if radiobutton is on videos we do a normal search
			else{
				this.Mediator.write("loadVideos", object);
			}
		}
	};
	
	//check if a specific videoId exist in results array
	DirectPlayControllerIndex.prototype.checkIfExist = function(video){
		var found = false;
		for (var i = 0; i < this.results.length; i++){
			if (video.id === this.results[i].id){
				found = true;
			};
		}
		return found;
	};

	//bound to playbutton
	DirectPlayControllerIndex.prototype.play = function(){
		$(this.playEl).toggleClass("active");
		this.Mediator.write("play");
		return false;
	};

	//bound to nextbutton
	DirectPlayControllerIndex.prototype.forward = function(){
		this.Mediator.write("playNext");
		return false;
	};

	//bound to previous button
	DirectPlayControllerIndex.prototype.previous = function(){
		this.Mediator.write("playPrev");
		return false;
	};
	
	//bound to shuffle button
	DirectPlayControllerIndex.prototype.toggleShuffle = function(){
		this.Mediator.write("toggleShuffle");
		$(this.shuffleEl).toggleClass("active");
		return false;
	};

	//bound to autoplay button (keep playing when list/queue is empty)
	DirectPlayControllerIndex.prototype.toggleAutoplay = function(){
		this.Mediator.write("toggleAutoplay");
		$(this.autoplayEl).toggleClass("active");
		return false;
	};

	//called when queue changes, updates the queue element
	DirectPlayControllerIndex.prototype.queueChanged = function(newQueue){
		var toggleEl = $("#show-queue");
		toggleEl.html("Queue (" + newQueue.length + ")");
		
		this.queueToggleEl.find(".preview").remove();
		toggleEl.show(400);
		for (var i=0; i < newQueue.length; ++i){
			this.queueToggleEl.append(newQueue[i].preview);
		}
	};

	//show the queue
	DirectPlayControllerIndex.prototype.showQueue = function(){
		this.queueToggleEl.toggle(200);
	};

	//bound to repeat button
	DirectPlayControllerIndex.prototype.toggleRepeat = function(){
		this.Mediator.write("toggleRepeat");
		$(this.repeatEl).toggleClass("active");
		return false;
	};

	//triggers when constraints keyup
	DirectPlayControllerIndex.prototype.constrKeypress = function(event){
		var key = event.which,
			that = this,
			backspace = key == 8,
			constraints = this.constraintEl.val().split(","),
			constraint = constraints[constraints.length - 1];
			
		if (constraint.length == 0 && constraints.length ==0){
			$(".video").show();
			return;
		}

		//triggers when we are inbetween two keywords
		if (constraint.length == 0){
			//input box is empty
			if (constraints.length <= 1){
				that.results.forEach(function(video){
					if (isHidden(video)){
						show(video);
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
							hide(video);
						}else if (backspace){
							show(video);
						}
					});
				}
		}
		else {
			constraint = constraint.replace("+","");
			if(constraint.length!==0){
				this.results.forEach(function(video){
					if (video.title.toLowerCase().indexOf(constraint) == -1){
						hide(video);
					}else if (backspace){
						show(video);
					}
				});
			}
		}
	};

	//clears result and all the video-elements
	DirectPlayControllerIndex.prototype.clear = function(){
		$(this.resultEl).empty();
		this.results = [];
		this.Mediator.write("resultsChange", this.results);
	};
	
	var hide = function(video){
		return $(video.element).hide();
	}	

	var show = function(video){
		return $(video.element).show();
	}	

	var isHidden = function(video){
		return video.element.style.display === "none";
	}	

	//update results when it changes
	var resultsChange = function(results){
		this.results = results;
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
				break;
		}
	}


})(window, document, jQuery);

},{"../Mediator.js":1,"../model/SearchMachine.js":3,"../model/YoutubePlayer.js":4}],3:[function(require,module,exports){
(function(win, doc, $, undefined){
	"use strict";	
	var PLAYLIST_QUERY_URL = "http://gdata.youtube.com/feeds/api/playlists/snippets?q=%s&v=2&alt=json",
		VIDEO_QUERY_URL = "http://gdata.youtube.com/feeds/api/videos?q=%s&max-results=50&v=2&alt=json",
		SINGLE_VIDEO_URL = "http://gdata.youtube.com/feeds/api/videos/%s?v=2&alt=json";

	//constructor of SearchMachine
	var SearchMachine = function(Mediator){
		this.Mediator = Mediator;

		this.buildQueryUrl = function(url,query){
			query = query.replace('ö','o');
			query = query.replace('ä','a');
			query = query.replace('å','a');
			query = query.replace(" ","+");
			return url.replace(/\%s/, query);
		};
		
		this.Mediator.subscribe("getVideoFromId", getVideoFromId.bind(this));
		this.Mediator.subscribe("loadPlaylists", loadPlaylists.bind(this));
		this.Mediator.subscribe("loadVideos", loadVideos.bind(this));
	};

	//called when need to harvest data from video id
	var getVideoFromId = function(object){
		var that = this,
			url = this.buildQueryUrl(SINGLE_VIDEO_URL, object.id);
		
		$.getJSON(url, function(data) {
			harvestData(data.entry, object.callback);
		});
	};

	//the callback will fire when all videos are found, its called from videocontrollers keypress if radiobuttovideos is checked
	var loadVideos = function(object){
		var url = this.buildQueryUrl(VIDEO_QUERY_URL, object.query),
			that = this;

		$.getJSON(url, function(data) {
			$.each(data.feed.entry, function(i, item){
				harvestData(item, object.callback);
			});
		});
	};
	
	//the callback will fire when all playlists are found, its called from videocontrollers keypress if radiobutton playlist is checked
	var loadPlaylists = function(object){
		var url = this.buildQueryUrl(PLAYLIST_QUERY_URL, object.query),
			feed = [];

		$.getJSON(url, function(data) {
			feed = data.feed.entry
			for (var i=0; i < feed.length; ++i) {
				var playlist = {};
				playlist.pTitle = feed[i].title.$t;
				playlist.pId = feed[i].yt$playlistId.$t;
				
				getVideosFromPlaylist(playlist, object.callback)
			}
		})
	};


	//harvers data from a videoresponse
	var harvestData = function(item, callback){
		var entry = {};

		//containing playlist
		entry.playlist = {};
					
		//id
		entry.id = item.media$group.yt$videoid.$t;
				
		//title
		entry.title = item.title.$t;
				
		//thumbnail
		if (item.media$group && item.media$group.media$thumbnail){
			entry.thumb = item.media$group.media$thumbnail[0].url;
		}
		else{
			entry.thumb = "/images/fallback_thumb.jpg";
		}

		//category of video
		if (item.category[1] && item.category[1].term){
			entry.category = item.category[1].term;
		}
		else{
			entry.category = "-";
		}
					
		//duration in minutes
		if (item.media$group && item.media$group.yt$duration){
			var seconds = item.media$group.yt$duration.seconds;
			var min = Math.floor(seconds / 60); 
			var remSec = (seconds % 60);
			
			if (remSec===0){ 
				entry.duration = min + ":00";
			}
			else{
				entry.durationSec = seconds;
				entry.duration = min + ":" + remSec.toString();
			}
		}
		else{
			entry.duration = "-";
		}

		//number of views
		if (item.yt$statistics && item.yt$statistics.viewCount){
			entry.views = item.yt$statistics.viewCount;
		}
		else{
			entry.views = 0;
		}
				
		//ratings and likes
		if (item.yt$rating && item.yt$rating.numLikes){
			entry.likes = item.yt$rating.numLikes;
			entry.dislikes = item.yt$rating.numDislikes;
		}
		else{
			entry.likes = 0;
			entry.dislikes = 0;
		}

		if (item.gd$rating && item.gd$rating.average){
			entry.average = item.gd$rating; 
		}
		else{
			entry.average = 0;
		}

		//url???

		callback(entry);
	};

	//this callback will fire for each video found, its called from VideoControllers keypress
	var getVideosFromPlaylist = function(playlist, callback){
		var url = 'https://gdata.youtube.com/feeds/api/playlists/' + playlist.pId + '?v=2&alt=json&callback=?',
			feed = [],
			that = this;

        $.getJSON(url, function(data){
        	feed = data.feed.entry;
			for (var i=0; i < feed.length; ++i){
				harvestData(feed[i], callback)
			}
		});
	}

	exports.SearchMachine = SearchMachine;
})(window, document, jQuery);

},{}],4:[function(require,module,exports){
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

},{}]},{},[2])
;
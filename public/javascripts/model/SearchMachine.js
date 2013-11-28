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

(function(win, doc, $, undefined){
	"use strict";	
	var BMAP = win.BMAP || {};
	var PLAYLIST_QUERY_URL = "https://gdata.youtube.com/feeds/api/playlists/snippets?q=%s&v=2&alt=json";
	var VIDEO_QUERY_URL = "http://gdata.youtube.com/feeds/api/videos?q=%s&max-results=50&v=2&alt=json"

	var SearchMachine = function(){
		this.buildQueryUrl = function(url,query){
			query = query.replace('ö','o');
			query = query.replace('ä','a');
			query = query.replace('å','a');
			query = query.replace(" ","+");
			return url.replace(/\%s/, query);
		};
	};
	
	//the callback will fire when all videos are found, its called from videocontrollers keypress if radiobuttovideos is checked
	SearchMachine.prototype.loadVideos = function(query, callback){
		var url = this.buildQueryUrl(VIDEO_QUERY_URL, query);
		$.getJSON(url, function(data) {
			$.each(data.feed.entry, function(i, item) {
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
					entry.thumb = "images/fallback_thumb.jpg";
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
						entry.duration = min + ":" + remSec;
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
					entry.views = "-";
				}
				
				//ratings and likes
				if (item.yt$rating && item.yt$rating.numLikes){
					entry.likes = item.yt$rating.numLikes;
					entry.dislikes = item.yt$rating.numDislikes;
					entry.average = Math.floor(entry.likes / entry.dislikes);
				}
				else{
					entry.likes = "-";
					entry.dislikes = "-";
					entry.average = "-";
				}

				callback(entry);
			});

		});
	};

	//the callback will fire when all playlists are found, its called from videocontrollers keypress if radiobutton playlist is checked
	SearchMachine.prototype.loadPlaylists = function(query, callback){
		var url = this.buildQueryUrl(PLAYLIST_QUERY_URL, query);
		var result = [];

		$.getJSON(url, function(data) {
			$.each(data.feed.entry, function(i, item) {
				var playlist = {};
				playlist.pTitle = item.title.$t;
				playlist.pId = item.yt$playlistId.$t;

				result.push(playlist);
			});

			if (typeof callback === "function") {
				callback(result);
			}
		});
	};

	//this callback will fire for each video found, its called from VideoControllers keypress
	SearchMachine.prototype.getVideosFromPlaylists = function(playlists, callback){
		$.each(playlists, function(i, playlist) {
		var url = 'http://gdata.youtube.com/feeds/api/playlists/' + playlist.pId + '?v=2&alt=json&callback=?';
			getVideos(url, playlist, callback);
		});
	};

	//Helper function to getvidfromplaylists
	function getVideos(url, playlist, callback){
		$.getJSON(url, function(data){
			$.each(data.feed.entry, function(i, item){
				var entry = {};
				
				//containing playlist
				entry.playlist = playlist;
				
				//id
				entry.id = item.media$group.yt$videoid.$t;
				
				//title
				entry.title = item.title.$t;
				
				//thumbnail
				if (item.media$group && item.media$group.media$thumbnail){
					entry.thumb = item.media$group.media$thumbnail[0].url;
				}
				else{
					entry.thumb = "images/fallback_thumb.jpg";
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
						entry.duration = min + ":" + remSec;
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
					entry.views = "-";
				}
				
				//ratings and likes
				if (item.yt$rating && item.yt$rating.numLikes){
					entry.likes = item.yt$rating.numLikes;
					entry.dislikes = item.yt$rating.numDislikes;
					entry.average = Math.floor(entry.likes / entry.dislikes);
				}
				else{
					entry.likes = "-";
					entry.dislikes = "-";
					entry.average = "-";
				}

				callback(entry);
			});
		});
	};

	BMAP.SearchMachine = SearchMachine;
	win.BMAP = BMAP;
})(window, document, jQuery);

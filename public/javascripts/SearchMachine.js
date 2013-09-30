(function(win, doc, $, undefined){
	"use strict";	
	var BMAP = win.BMAP || {};
	var QUERY_URL = "https://gdata.youtube.com/feeds/api/playlists/snippets?q=%s&v=2&alt=json";

	var SearchMachine = function(){
		this.buildQueryUrl = function(query){
			query = query.replace('ö','o');
			query = query.replace('ä','a');
			query = query.replace('å','a');
			query = query.replace(" ","+");
			return QUERY_URL.replace(/\%s/, query);
		};
	};
	
	//this callback will fire when all playlists are found, its called from VideoControllers keypress
	SearchMachine.prototype.loadPlaylists = function(query, callback){
		var url = this.buildQueryUrl(query);
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
		var url = 'http://gdata.youtube.com/feeds/api/playlists/' + playlist.id + '?v=2&alt=json&callback=?';
			getVideos(url, playlist, callback);
		});
	};

	//Helper function to getvidfromplaylists
	function getVideos(url, playlist, callback){
		$.getJSON(url, function(data){
			$.each(data.feed.entry, function(i, item){
				if (!BMAP.tmp){
					BMAP.tmp = item;
				}
				var entry = {};
				entry.playlist = playlist;
				entry.id = item.media$group.yt$videoid.$t;
				entry.title = item.title.$t;
				
				if (item.media$group && item.media$group.media$thumbnail){
					entry.thumb = item.media$group.media$thumbnail[0].url;
				}
				else{
					entry.thumb = "images/fallback_thumb.jpg";
				}
				// entry.user = item.author[0].yt$userid.$t;
				// entry.term = item.category[1].term + "";
				// entry.viewcount = item.yt$statistics.viewcount + "";
				// entry.dislikes = item.yt$rating.numdislikes + "";
				// entry.likes = item.yt$rating.numlikes + "";
				callback(entry);
			});
		});
	};

	//searches for videos eg. normal search
	SearchMachine.prototype.loadVideos = function(query, callback){


	};
	
	BMAP.SearchMachine = SearchMachine;
	win.BMAP = BMAP;
})(window, document, jQuery);

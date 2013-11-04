(function(win, doc, $, undefined){
	"use strict";
	var BMAP = win.BMAP || {};

	//constructor for PlaylistHandler
	var PlaylistHandler = function(){
		this.playlistName = $("#name-div").val();
		this.createEl 	= $("#create-playlist").on("click", this.createNewPlaylist.bind(this));
	};

	//creates a new playlist if it does not exists
	PlaylistHandler.prototype.createNewPlaylist = function(){
		var that = this;
		var name = win.prompt("Enter playlist name","");
		if (name!==null && name!==undefined && name!==""){
			this.checkIfExist(name,function(found){
				if (!found){
					that.createNewDocument(name,function(created){
						if (created){
							BMAP.MessageBoard.putTemporary("Playlist " + name + " has been created");
							var url = "http://" + doc.domain + ":" + location.port + "/playlists/" + name;
							win.location = url;
						}
						else{
							BMAP.MessageBoard.putTemporary("Playlist " + name + " was not created");
						}	
					});
				}
				else{
					BMAP.MessageBoard.putTemporary("Playlist " + name + " does already exist");
				}
			});
		}
	};
	
	//call server to see if a playlist exists
	PlaylistHandler.prototype.checkIfExist = function(name, callback){
		console.log(this.serverUrl);
		$.ajax({
			url: "/checkifexist/?name=" + name + "&callback=?",
			dataType:"jsonp",
			beforesend: function(){
				console.log("Sending...");
			},
			success: function(data){
				console.log("Found Playlist : " + data.found);
				callback(data.found);
			}
		});
	};

	//calls server and creates a new document
	PlaylistHandler.prototype.createNewDocument = function(name, callback){
		console.log("in create new;");
		$.ajax({
			url: "/createnewplaylist/?name=" + name + "&callback=?",
			dataType:"jsonp",
			beforeSend: function(){
				console.log("Sending...");
			},
			success: function(data){
				console.log("Success!")
				callback(data.created);
			}
		});
	};	
	
	//push videoids to server
	PlaylistHandler.prototype.push = function(videos){
		var that = this;
		var videosTemp = videos;
		if (this.playlistName){
			for (var i = 0; i < videosTemp.length; i++){
				$(videosTemp[i].element).find(".add-to-playlist").hide();
				videosTemp[i].element = {};
				
				var str = JSON.stringify(videosTemp[i]);
				$.ajax({
					url: "/push/" + this.playlistName + "?video=" + replaceChars(str) + "&callback=?",
					dataType:"jsonp",
					beforeSend: function(){
						console.log("Pushing " + videosTemp[i].title);
					},
					success: function(id){
						console.log("Success!")
						console.log(id + " pushed to " + that.playlistName);
					}
				});
			};
		};
	};

	var replaceChars = function(video){
		return video.replace("&","//a").replace("%","//p");
	};

	PlaylistHandler.prototype.isAttached = function(){
		return this.playlistName!==undefined;
	}

	BMAP.PlaylistHandler = PlaylistHandler;
	win.BMAP = BMAP;
})(window, document, jQuery);

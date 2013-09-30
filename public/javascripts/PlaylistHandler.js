(function(win, doc, $, undefined){
	"use strict";
	var BMAP = win.BMAP || {};
	var serverUrl = "http://localhost:3000/playlists/";
	var playlistName = undefined;
	var playlistUrl;

	//constructor for PlaylistHandler
	var PlaylistHandler = function(){
		this.createEl 	= $("#create-playlist").on("click", this.createNewPlaylist.bind(this));
		this.attachEl 	= $("#attach-playlist").on("click", this.attachPlaylist.bind(this));
		this.playlistEl = $("#attached-playlist").on("click", this.getToPLaylist.bind(this)).hide();
	};

	//creates a new playlist if it does not exists
	PlaylistHandler.prototype.createNewPlaylist = function(){
		var that = this;
		var name = win.prompt("Enter playlist name","");
		if (name!==null && name!==undefined || name!==""){
			checkIfExist(name,function(found){
				if (!found){
					createNewDocument(name,function(created){
						if (created){
							BMAP.MessageBoard.putTemporary("Playlist " + name + " has been created");
							that.attach(name);
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
	var checkIfExist = function(name, callback){
		$.ajax({
			url: serverUrl + "?q=" + name + "&f=checkIfExist" + "&callback=?",
			dataType:"jsonp",
			beforeSend: function(){
				console.log("Sending...");
			},
			success: function(data){
				callback(data.found);
			}
		});
	};

	//calls server and creates a new document
	var createNewDocument = function(name, callback){
		$.ajax({
			url: serverUrl + "?q=" + name + "&f=createNewPlaylist" + "&callback=?",
			dataType:"jsonp",
			beforeSend: function(){
				console.log("Sending...");
			},
			success: function(data){
				callback(data.created);
			}
		});
	};	
	
	//attach a playlist to the view
	PlaylistHandler.prototype.attach = function(name){
		this.createEl.hide();
		this.attachEl.hide();
		this.playlistEl.show().text("Open attached playlist");
		this.playlistName = name;
		this.playlistUrl = serverUrl + name.replace(" ", "+");
		$(".add-to-playlist").show();		
		BMAP.MessageBoard.putTemporary("The view is now attached to " + name);
	};

	//opens a new tab with the playlist attached
	PlaylistHandler.prototype.getToPLaylist = function(){
		win.open(this.playlistUrl, "_blank");
	};

	//called when attach playlist is clicked, if the playlist name exists its attached to the view
	PlaylistHandler.prototype.attachPlaylist = function(name){
		var that = this;
		var name = win.prompt("Enter playlist name","here");
		
		checkIfExist(name,function(found){
			if (found){
				that.attach(name);
			}
			else{
				BMAP.MessageBoard.putTemporary("Playlist " + name + " was not found");
			}
		});
	};

	//push videoids to server
	PlaylistHandler.prototype.push = function(videos){
		var that = this;
		var videosTemp = videos;
		if (this.playlistName){
		for (var i = 0; i < videosTemp.length; i++){
				videosTemp[i].element = {};
				$.ajax({
					url: serverUrl + "?q=" + this.playlistName + "&video=" + JSON.stringify(videosTemp[i]) + "&f=push" + "&callback=?",
					dataType:"jsonp",
					beforeSend: function(){
						console.log("Pushing " + videosTemp[i].title);
					},
					success: function(id){
						console.log(id + " pushed to " + that.playlistName);
					}
				});
			};
		};
	};

	PlaylistHandler.prototype.isAttached = function(){
		return this.playlistName!==undefined;
	}

	BMAP.PlaylistHandler = PlaylistHandler;
	win.BMAP = BMAP;
})(window, document, jQuery);

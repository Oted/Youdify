(function(win, doc, $, undefined){
	"use strict";
	var BMAP = win.BMAP || {};
	var playlistName = undefined;

	//constructor for PlaylistHandler
	var PlaylistHandler = function(){
		this.host  = $("#host-div").val();
		this.port  = $("#port-div").val();

		this.createEl 	= $("#create-playlist").on("click", this.createNewPlaylist.bind(this));
		this.attachEl 	= $("#attach-playlist").on("click", this.attachPlaylist.bind(this));
		this.playlistEl = $("#attached-playlist").on("click", this.getToPLaylist.bind(this)).hide();
		this.serverUrl = "http://" + this.host + ":" + this.port + "/playlists/";
		this.playlistUrl;
	};

	//creates a new playlist if it does not exists
	PlaylistHandler.prototype.createNewPlaylist = function(){
		var that = this;
		var name = win.prompt("Enter playlist name","");
		if (name!==null && name!==undefined || name!==""){
			this.checkIfExist(name,function(found){
				if (!found){
					that.createNewDocument(name,function(created){
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
	PlaylistHandler.prototype.checkIfExist = function(name, callback){
		$.ajax({
			url: this.serverUrl 
				+ "?q=" + name + "&f=checkIfExist" 
				+ "&callback=?",
			dataType:"jsonp",
			beforesend: function(){
				console.log("sending...");
			},
			success: function(data){
				console.log("success!")
				callback(data.found);
			}
		});
	};

	//calls server and creates a new document
	PlaylistHandler.prototype.createNewDocument = function(name, callback){
		$.ajax({
			url: this.serverUrl 
				+ "?q=" + name + "&f=createNewPlaylist" 
				+ "&callback=?",
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
	
	//attach a playlist to the view
	PlaylistHandler.prototype.attach = function(name){
		this.createEl.hide();
		this.attachEl.hide();
		this.playlistEl.show().text("Open attached playlist");
		this.playlistName = name;
		this.playlistUrl = this.serverUrl + name.replace(" ", "+");
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
		
		this.checkIfExist(name,function(found){
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
				$(videosTemp[i].element).find(".add-to-playlist").hide();
				videosTemp[i].element = {};
				
				var str = JSON.stringify(videosTemp[i]);
				$.ajax({
					url: this.serverUrl 
						+ "?q=" + this.playlistName 
						+ "&video=" + replaceChars(str)
						+ "&f=push" + "&callback=?",

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

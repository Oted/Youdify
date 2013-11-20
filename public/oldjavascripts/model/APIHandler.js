(function(win, doc, $, undefined){
	"use strict";
	var BMAP = win.BMAP || {};

	//constructor for PlaylistHandler
	var APIHandler = function(plName){	
		this.playlistName = plName; 
		
		BMAP.Mediator.subscribe("pushVideo", pushVideo.bind(this));	
		BMAP.Mediator.subscribe("submitPlaylist", this.submitPlaylist.bind(this));	
	};

	APIHandler.prototype.submitPlaylist = function(prop){
		var that = this,
			url;

		if (validProperties(prop)){
			checkIfExist(prop.name,function(found){
				if (!found){
					that.createNewDocument(prop,function(created){
						if (created){
							url = "http://" + doc.domain + ":" + location.port + "/playlists/" + prop.name;
							win.location = url;
						}
						else{
							BMAP.Mediator.write("temporaryMessage", "Playlist " + name + " was not created");
						}	
					});
				}
				else{
					alert("Playlist with that name already exist");
				}
			});
		}
	};

	//check if playlist properties are ok to send
	var validProperties = function(prop){
		if (prop.name && prop.name.length >= 3 && prop.name.length <= 20){	
			prop.name = replaceChars(prop.name);
			if (prop.desc && prop.desc.length >= 5 && prop.desc.length <= 120){
				prop.desc = replaceChars(prop.desc);
				if (prop.tag){
					if (prop.freetag.length < 12 && prop.freetag.indexOf(" ")==-1){
						prop.freetag = replaceChars(prop.freetag);
						return true;
					}
					else{
						alert("Invalid freetag, freetags may not cantain any spaces and must be less than 12 characters")
						return false;
					}
						
				}
				else{
					alert("No tag selected :O");
					return false;
				}
			}
			else{
				alert("You must type a description between 5 and 120 characters");
				return false;
			}	
		}
		else{
			alert("Invalid name property, must be between 3 and 20 characters long");
			return false; 
		}
	};

	//call server to see if a playlist exists
	var checkIfExist = function(name, callback){
		$.ajax({
			url: "/checkifexist/?name=" + name + "&callback=?",
			dataType:"jsonp",
			beforesend: function(){
				console.log("Checking if " + name + " exists");
			},
			success: function(data){
				console.log("Found Playlist : " + data.found);
				callback(data.found);
			}
		});
	};

	//calls server and creates a new document
	APIHandler.prototype.createNewDocument = function(prop, callback){
		$.ajax({
			url: "/createnewplaylist/?name=" + prop.name + "&desc=" + prop.desc + "&tag=" + prop.tag + "&freetag=" + prop.freetag + "&callback=?",
			dataType:"jsonp",
			beforeSend: function(){
				console.log("Creating new new playlist");
			},
			success: function(data){
				console.log("Success!")
				callback(data.created);
			}
		});
	};	
	
	//push videoids to server
	var pushVideo = function(video){
		var that = this;
		if (this.playlistName){
			$.ajax({
				url: "/push/" + this.playlistName + "?video=" + video.id + "&callback=?",
				dataType:"jsonp",
				beforeSend: function(){
					console.log("Pushing " + video.title);
				},
				success: function(id){
					console.log("Success!")
					console.log(id + " pushed to " + that.playlistName);
				}
			})
		}
	};

	var replaceChars = function(string){
		return string.replace("&","//a").replace("%","//p");
	};

	BMAP.APIHandler = APIHandler;
	win.BMAP = BMAP;
})(window, document, jQuery);

(function(win, doc, $, undefined){
	"use strict";

	//constructor for PlaylistHandler
	var APIHandler = function(Mediator, plName){	
		this.playlistName = plName;

		this.Mediator = Mediator;	
		this.Mediator.subscribe("submitPlaylist", this.submitPlaylist.bind(this));	
		//this.Mediator.subscribe("sendMessage", this.sendMessage.bind(this));	
		this.Mediator.subscribe("pushVideo", this.pushVideo.bind(this));	
		this.Mediator.subscribe("getPlaylists", this.getPlaylists.bind(this));	
		this.Mediator.subscribe("authenticate", this.authenticate.bind(this));	
		this.Mediator.subscribe("deleteVideo", this.deleteVideo.bind(this));	
		this.Mediator.subscribe("searchPlaylistsByName", this.searchPlaylistsByName.bind(this));	
		this.Mediator.subscribe("searchPlaylistsByFreetag", this.searchPlaylistsByFreetag.bind(this));	
	};

	//searches for playlists by freetag
	APIHandler.prototype.searchPlaylistsByFreetag = function(obj){	
		console.log(obj);
		$.ajax({
			url: "/searchplaylistsbyfreetag/?query=" + obj.query + "&callback=?",
			dataType:"jsonp",
			beforesend: function(){
				console.log("Search for playlists with query " + obj.query);
			},
			success: function(data){
				console.log("Success!!");
				obj.callback(data.data)
			}
		});
	};

	//searches for playlists by name
	APIHandler.prototype.searchPlaylistsByName = function(obj){	
		$.ajax({
			url: "/searchplaylistsbyname/?query=" + obj.query + "&callback=?",
			dataType:"jsonp",
			beforesend: function(){
				console.log("Search for playlists with query " + obj.query);
			},
			success: function(data){
				console.log("Success!!");
				obj.callback(data.data)
			}
		});
	};

	//delete the video all together from the database
	APIHandler.prototype.deleteVideo = function(obj){
		$.ajax({
			url: "/deletevideo/?name=" + obj.name + "&id=" + obj.id +"&callback=?",
			dataType:"jsonp",
			beforesend: function(){
				console.log("Delete video " + obj.id);
			},
			success: function(data){
				console.log("Success!!")
			}
		});
	};

	//authenticates and give preveliges to a user
	APIHandler.prototype.authenticate = function(obj){
		var that = this;
		$.ajax({
			url: "/auth",
			type:"POST",
			data: {"username":obj.playlist,"password":obj.password},
			success: function(obj){
				if (obj.auth===true){
					that.Mediator.write("authenticated", obj.doc);
				}
			}
		});

	};

	//get a collection of playlists from the database
	APIHandler.prototype.getPlaylists = function(obj){
		$.ajax({
			url: "/getplaylists/?type=" + obj.type + "&count=" + obj.count +"&callback=?",
			dataType:"jsonp",
			beforesend: function(){
				console.log("Getting " + obj.type +  " from server");
			},
			success: function(data){
				obj.callback(data.data);
			}
		});
	};

	//submit a playlist to the server
	APIHandler.prototype.submitPlaylist = function(prop){
		var that = this,
			url;
		
		if (validProperties(prop)){
			checkIfExist(prop.name,function(found){
				if (!found && !prop.isAuthenticated){
					that.createNewDocument(prop,function(created){
						if (created){
							url = "http://" + doc.domain + ":" + location.port + "/playlists/" + prop.name;
							win.location = url;
						}
						else{
							this.Mediator.write("temporaryMessage", "Playlist " + name + " was not created");
						}	
					});
				}
				else if (prop.isAuthenticated){
					if (prop.name !== prop.oldName){
						checkIfExist(prop.name,function(found){
							if (found){
								this.Mediator.write("temporaryMessage", "A Playlist with that name already exist, try another");
							}
						});
					}	
					else{	
						updateDocument(prop, function(data){
							//code goes here!!
						});
					}
				}
				else{
					if (prop.isAuthenticated === false){
						alert("You are not allowed to do this");
					}
					else{
						alert("Playlist with that name already exist");
					}
				}
			});
		}
	};

	//check if playlist properties are ok to send
	var validProperties = function(prop){
		if (!prop.password || prop.password.length != 0){
			if (prop.name && prop.name.length >= 3 && prop.name.length <= 30){	
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
				alert("Invalid name, must be between 3 and 30 characters long");
				return false; 
			}
		}
		else{
			alert("You must set a password, a playlist must have its owner who can delete videos");
			return false; 
		};
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
			url: "/createnewplaylist/?name=" + prop.name + 
									"&password=" + prop.password +
									"&desc=" + prop.desc + 
									"&tag=" + prop.tag + 
									"&freetag=" + prop.freetag + 
									"&callback=?",
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
	
	//calls server and update the playlist
	var updateDocument = function(prop, callback){
		var url;
		$.ajax({
			url: "/updateplaylist/?name=" + prop.name + 
									"&oldname=" + prop.oldName + 
									"&desc=" + prop.desc + 
									"&tag=" + prop.tag + 
									"&freetag=" + prop.freetag + 
									"&locked=" + prop.locked +
									"&callback=?",
			dataType:"jsonp",
			beforeSend: function(){
				console.log("Updating playlist...");
			},
			success: function(data){
				console.log(data);
			}
		});
	};	

	//push videoids to server
	APIHandler.prototype.pushVideo = function(video){
		var that = this;
		if (this.playlistName){
			$.ajax({
				url: "/push/?name=" + this.playlistName + "&video=" + video.id + "&callback=?",
				dataType:"jsonp",
				beforeSend: function(){
					console.log("Pushing " + video.title);
				},
				success: function(data){
					console.log(data.pushed);
				}
			})
		}
	};

	var replaceChars = function(string){
		return string.replace("&","//a").replace("%","//p");
	};
	
	exports.APIHandler = APIHandler;
})(window, document, jQuery);

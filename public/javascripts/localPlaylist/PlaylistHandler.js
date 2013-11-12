(function(win, doc, $, undefined){
	"use strict";
	var BMAP = win.BMAP || {};

	//constructor for PlaylistHandler
	var PlaylistHandler = function(){
		this.playlistName = $("#name-div").val();
		this.createEl 	= $("#create-playlist").on("click", this.createNewPlaylist.bind(this));
		this.submitEl 	= $("#submit").on("click", this.submit.bind(this));
		this.createFormEl = $("#create-new-playlist-div");
	};

	PlaylistHandler.prototype.submit = function(){
		var prop = {}, that = this;
		prop.name = $("#pname").val();
		prop.desc = $("#pdescription").val();
		prop.tag = $("#tag-select option:selected").attr("id");
		prop.freetag = $("#pfreetag").val();

		if (this.validProperties(prop)){
			this.checkIfExist(prop.name,function(found){
				if (!found){
					that.createNewDocument(prop,function(created){
						if (created){
							var url = "http://" + doc.domain + ":" + location.port + "/playlists/" + prop.name;
							win.location = url;
						}
						else{
							BMAP.MessageBoard.putTemporary("Playlist " + name + " was not created");
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
	PlaylistHandler.prototype.validProperties = function(prop){
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

	//creates a new playlist if it does not exists
	PlaylistHandler.prototype.createNewPlaylist = function(){
		var that = this;
		$(this.createFormEl).toggle(100);
	};
	
	//call server to see if a playlist exists
	PlaylistHandler.prototype.checkIfExist = function(name, callback){
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
	PlaylistHandler.prototype.createNewDocument = function(prop, callback){
		console.log("in create new;");
		$.ajax({
			url: "/createnewplaylist/?name=" + prop.name + "&desc=" + prop.desc + "&tag=" + prop.tag + "&freetag=" + prop.freetag + "&callback=?",
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
				
				$.ajax({
					url: "/push/" + this.playlistName + "?video=" + videosTemp[i].id + "&callback=?",
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

	var replaceChars = function(string){
		return string.replace("&","//a").replace("%","//p");
	};

	PlaylistHandler.prototype.isAttached = function(){
		return this.playlistName!==undefined;
	}

	BMAP.PlaylistHandler = PlaylistHandler;
	win.BMAP = BMAP;
})(window, document, jQuery);

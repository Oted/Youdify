// this file hadles the UI for a Playlist
(function(win, doc, $, undefined){	
  	"use strict"
	
	//the first to run when document is ready
	$(function(){
		$("#main-sidebar").toggle().toggle();
		
		//Create new PlaylistController
		new PlaylistControllerIndex();	
	});
	
	//contructor of PlaylistController
	var PlaylistControllerIndex = function(){
		this.playlistName 	= doc.getElementById("name-div").value;
		this.Mediator = require("../Mediator.js").Mediator;
		
		var YoutubePlayer = require("../model/YoutubePlayer.js").YoutubePlayer;
		new YoutubePlayer(this.Mediator,280, 200);
	
		var SearchMachine = require("../model/SearchMachine.js").SearchMachine;
		new SearchMachine(this.Mediator);

		var PlaylistSocket = require("../model/PlaylistSocket.js").PlaylistSocket;
		new PlaylistSocket(this.Mediator);

		var MessageBoard = require("../model/MessageBoard.js").MessageBoard;
		new MessageBoard(this.Mediator);

		var APIHandler = require("../model/APIHandler.js").APIHandler;
		new APIHandler(this.Mediator, this.playlistName);

		this.Mediator.subscribe("playerStateChange", playerStateChange.bind(this));
		this.Mediator.subscribe("removeVideo", removeVideo.bind(this));
		this.Mediator.subscribe("resultsChange", resultsChange.bind(this));
		this.Mediator.subscribe("videoPushed", this.videoPushed.bind(this));
		this.Mediator.subscribe("queueChanged", this.queueChanged.bind(this));
		this.Mediator.subscribe("authenticated", this.authenticated.bind(this));
	
		//mediator calls for handle chat	
		this.Mediator.subscribe("clientLeave", this.numberOfClientsChanged.bind(this));
		this.Mediator.subscribe("newClient", this.numberOfClientsChanged.bind(this));		
		//this.Mediator.subscribe("chatLeave", this.newChatEntry.bind(this));
		this.Mediator.subscribe("chatJoin", this.newChatEntry.bind(this));
		this.Mediator.subscribe("chatMessage", this.newChatEntry.bind(this));

		this.overlayed 		= false;
		this.addNewToQue 	= false;
		this.isPlaying 		= false;
		this.results 		= [];
		
		this.initUI();
	};	

	//bind and set attr on UI controls
	PlaylistControllerIndex.prototype.initUI = function(){
		var that = this;
		this.overlayEl 			= $("#overlay-wrapper");
		this.resultEl       	= $("#video-list");
		this.navToggleEl		= $("#navigation-toggle");
		this.queueToggleEl 		= $("#queue-toggle");
		this.settingsToggleEl 	= $("#edit-playlist-div");
		this.chatToggleEl 		= $("#chat-toggle");
		this.iframeSrc 			= $("#overlay-wrapper").attr("src");
		this.chatClient 		= undefined;
		this.overlayBEl 	= $("#overlay-background")
		.on("click", this.toggleAddVideo.bind(this));

		$("#home").attr("href", "http://" + doc.domain);
		
		$("#claim").attr("href", "#").on("click", function(){
			var password = prompt("Please enter password");
			if (password){
				that.Mediator.write("authenticate", {"playlist":that.playlistName,"password":password})
			}
		});

		$("#message-input")
		.on("keypress", function(event){
			if(event.which === 13){
				that.sendMessage();
			}			
		});

		$("#message-send")
		.on("click", this.sendMessage.bind(this)); 
	
		$("#submit")
		.on("click", this.submitPlaylist.bind(this))
		.attr("title","Save and submit the playlist");

		$("#add-video")
		.on("click", this.toggleAddVideo.bind(this))
		.attr("title","Add new video to the playlist");
		
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

		$("#show-settings")
		.on("click", this.showSettings.bind(this));
		
		$("#show-chat")
		.on("click", this.showChat.bind(this));

		this.addNewToQueEl 	= $("#add-new-to-queue")
		.on("click", this.toggleAddNewToQue.bind(this))
		.attr("title","Toggle add new to queue, if this is enabled videos pushed by anyone will be added to queue and played automatically");
  		
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
	
	//submits the new playlist to the APIHandler to verify it
	PlaylistControllerIndex.prototype.submitPlaylist = function(){
		var selectTagEl = doc.getElementById("tag-select"),
			prop = {};
		
		prop.oldName = this.playlistName;
		prop.isAuthenticated = isAuthenticated;
		prop.name = doc.getElementById("pname").value;
		prop.desc = doc.getElementById("pdescription").value;
		prop.freetag = doc.getElementById("pfreetag").value.replace("#","");
		prop.tag = selectTagEl.options[selectTagEl.selectedIndex].value;
		prop.locked = $("#lock").prop("checked");

		this.Mediator.write("submitPlaylist", prop);
	};

	//called from APIhandler when server authenticated this session
	PlaylistControllerIndex.prototype.authenticated = function(obj){
		isAuthenticated = true;
		this.Mediator.write("temporaryMessage", "You are now authenticated :)");

		$(".hide-video").text("Delete");
		$("#claim").hide();
	
		//pre-settings for editing playlist
		$("#pname").val(obj.name);
		$("#pdescription").val(obj.description);
		$("#pfreetag").val(obj.freetag);
		$("#tag-select").val(obj.category);
		if (obj.locked){$("#lock").prop("checked", true);}
		else {$("#unlock").prop("checked",true)};

		$("#show-settings").show();
	};

	//start the chat!
	PlaylistControllerIndex.prototype.showChat = function(){
		var colors = ["chocolate","indigo", "tomato", "sienna", "blue", "crimson", "darkgreen", "dimgray", "yellow", "springgreen"],
			r = Math.floor(Math.random()*colors.length),
			tempNick;
		
		$("#new-message").hide(200);
		if (!this.chatClient){
			tempNick = prompt("Please enter your nickname");
			if (tempNick){
				this.chatClient = {"color":colors[r],"nickName":tempNick};

				//tell the others you joined the chat
				this.Mediator.write("joinChat", this.chatClient);
				this.chatToggleEl.toggle(400);
			}else{
				return;	
			}
		}else{
			this.chatToggleEl.toggle(400);
		}
	};

	//sends a message to other clients
	PlaylistControllerIndex.prototype.sendMessage = function(){
		var message = doc.getElementById("message-input").value,
			obj = this.chatClient;

		if (message.length > 0){
			if (this.chatClient){
				obj.message  = message;
				this.Mediator.write("sendMessage", obj);
				doc.getElementById("message-input").value = "";
			}
			else{
				this.Mediator.write("temporaryMessage", "No nickname :(");
			}
		}
	};

	//show settings
	PlaylistControllerIndex.prototype.showSettings = function(){
		this.settingsToggleEl.toggle(200);
	};

	//show the queue
	PlaylistControllerIndex.prototype.showQueue = function(){
		this.queueToggleEl.toggle(200);
	};

	//received chatmessage from the socket
	PlaylistControllerIndex.prototype.newChatEntry = function(obj){
		if (obj.message){
			$("#chat-entries").append("<div class='chat-message'><p style='color:" + obj.color + "'>"+ 
										obj.nickName + " says : " + obj.message + "</p></div>");
			if (this.chatToggleEl[0].style.display === "none") {
				$("#new-message").show(200);
			}
		}else{
			$("#chat-entries").append("<div class='chat-message'><p style='color:" + obj.color + "'>"+ 
										obj.nickName + " has joined the playlist" + "</p></div>");
		}
		doc.getElementById("chat-entries").scrollTop = 9999999999;
	};

	//called when chat state changes
	PlaylistControllerIndex.prototype.numberOfClientsChanged = function(obj){
		var toggleEl = $("#show-chat");
		$("#number-of-users").text("(" + obj.clients + ")");

		if (obj.clients < 2){
			this.chatToggleEl.hide(200);
			toggleEl.hide(400);
		}
		else{
			toggleEl.show(400);
		}
	};
	
	//called when queue changes, updates the queue element
	PlaylistControllerIndex.prototype.queueChanged = function(newQueue){
		var toggleEl = $("#show-queue");
		toggleEl.html("Queue (" + newQueue.length + ")");
		
		this.queueToggleEl.find(".preview").remove();
		toggleEl.show(400);
		for (var i=0; i < newQueue.length; ++i){
			this.queueToggleEl.append(newQueue[i].preview);
		}
	};
	
	//called each time a video is pushed throu socket
	PlaylistControllerIndex.prototype.videoPushed = function(videoId){
		var that = this,
			object = {
				id : videoId,
				callback : function(video){
					if (!that.checkIfExist(video)){
						that.generateResultDiv(video);	
						if (that.addNewToQue){
							that.Mediator.write("queueVideoLast", video);
						}
					}
					else{
						if (that.addNewToQue){
							that.Mediator.write("queueVideoLast", video);
						}		
					}	
				}	
			}
		this.Mediator.write("getVideoFromId", object);
	};

	//back and forth between adding videos and playlist
	PlaylistControllerIndex.prototype.toggleAddVideo = function(){
		if (!isLocked || isAuthenticated){
			this.overlayed = !this.overlayed;
			if (!this.overlayed){
				this.overlayEl.attr("src", "");
				$("#overlay-wrapper").toggle(400);	
				$("#main-sidebar").toggle();
    			$("#player").toggle();
    			this.overlayBEl.toggle(100);
    			$("body").toggleClass('no-scrolling');
			}
			else{
				if (this.overlayEl.attr("src")!==this.iframeSrc){
					this.overlayEl.attr("src", this.iframeSrc);
				}
	
				this.overlayEl.load(function(){
					console.log("Iframe loaded");	
				});	
			
				this.overlayEl.toggle(800);	
				$("#main-sidebar").toggle();
    			$("#player").toggle();
    			this.overlayBEl.toggle(100);
    			$("body").toggleClass('no-scrolling');	
			}
		}
		else{
			this.Mediator.write("warningMessage", "This playlist is locked, only authenticated users may add or unlock it.");
		}
	};

	//returns the bool addNewToQue
	PlaylistControllerIndex.prototype.getAddNewToQue = function(){
		return this.addNewToQue;
	};
			
	//toggle addNewToQue (add pushed songs to queue)
	PlaylistControllerIndex.prototype.toggleAddNewToQue = function(){
		this.addNewToQue = !this.addNewToQue;
		$(this.addNewToQueEl).toggleClass("active");
		
		if (this.addNewToQue){
			this.Mediator.write("temporaryMessage", "New videos will now be added to the queue");
		}
		else {
			this.Mediator.write("temporaryMessage", "Add new to queue is now off");
		}

		//code for animations here
		return false;
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

	//bound to playbutton
	PlaylistControllerIndex.prototype.play = function(){
		$(this.playEl).toggleClass("active");
		this.Mediator.write("play");
		return false;
	};

	//bound to nextbutton
	PlaylistControllerIndex.prototype.forward = function(){
		this.Mediator.write("playNext");
		return false;
	};

	//bound to previous button
	PlaylistControllerIndex.prototype.previous = function(){
		this.Mediator.write("playPrev");
		return false;
	};
	
	//bound to shuffle button
	PlaylistControllerIndex.prototype.toggleShuffle = function(){
		this.Mediator.write("toggleShuffle");
		$(this.shuffleEl).toggleClass("active");
		return false;
	};

	//bound to autoplay button (keep playing when list/queue is empty)
	PlaylistControllerIndex.prototype.toggleAutoplay = function(){
		this.Mediator.write("toggleAutoplay");
		$(this.autoplayEl).toggleClass("active");
		return false;
	};


	//bound to repeat button
	PlaylistControllerIndex.prototype.toggleRepeat = function(){
		this.Mediator.write("toggleRepeat");
		$(this.repeatEl).toggleClass("active");
		return false;
	};
	
	//creates a new video element and append it to the list
	PlaylistControllerIndex.prototype.generateResultDiv = function(video){
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

	//check if a specific videoId exist in results array
	PlaylistControllerIndex.prototype.checkIfExist = function(video){
		var found = false;
		for (var i = 0; i < this.results.length; i++){
			if (video.id === this.results[i].id){
				found = true;
			};
		}
		return found;
	};

	//clears result and all the video-elements
	PlaylistControllerIndex.prototype.clear = function(){
		$(this.resultEl).empty();
		this.results = [];
		this.Mediator.write("resultsChange", this.results);
	};
	
	//remove the given video from the div and array
	var removeVideo = function(video){
		for(var i = this.results.length; i--;) {
			if (this.results[i].id === video.id) {
				this.Mediator.write("putTemporary", "Video has been removed");
				$(this.results[i].element).remove();
				this.results.splice(i, 1);
				this.Mediator.write("resultsChange", this.results);
			}
		}
	};
	
	//update results when it changes
	var resultsChange = function(results){
		$("#number-of-videos").text("(" + results.length + ")");
		this.results = results;
	};

})(window, document, jQuery);

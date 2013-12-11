(function(win, doc, $, undefined){
    "use strict";
	//the first to run when document is ready
    $(function(){
		$("#main-sidebar").toggle().toggle();	
		new FirstpageControllerIndex();	
	});
	
	//constructor for firstpage controller
	var FirstpageControllerIndex = function(){	
		this.results 	= [];
		this.Mediator 	= require("../Mediator.js").Mediator;
		
		var APIHandler 	= require('../model/APIHandler.js').APIHandler;
		new APIHandler(this.Mediator);		
	
		this.initUi();
	};

	//bind and set attr on UI controls
	FirstpageControllerIndex.prototype.initUi = function(){
		var that = this;
		this.createFormEl 	= doc.getElementById("create-new-playlist-div");
		this.resultEl 		= doc.getElementById("search-results");
			
		$("#create-playlist")
		.on("click", this.toggleCreatePlaylistForm.bind(this))
		.attr("title","Create a new playlist");
	
		$("#submit")
		.on("click", this.submitPlaylist.bind(this))
		.attr("title","Save and submit the playlist");

		$(".request-button")
		.on("click", function(){
			that.getPlaylists($(this).attr("id"));		
		});

		$("#sort-category-1")
		.on("click", function(){
			that.sortOnCategory(1);
		});

		this.getPlaylists("new");
	};

	//get a collection of playlists
	FirstpageControllerIndex.prototype.getPlaylists = function(type){
		var that = this,
			obj = {
				type : type,
				count : 10,
				callback : function(playlists){
					for (var i = 0; i < playlists.length; ++i){
						that.generateResultDiv(playlists[i]);
					}
				}
			}
		this.clear();
		$("#"+type).addClass("active");
		this.Mediator.write("getPlaylists", obj);
	};

	//sort the results
	FirstpageControllerIndex.prototype.sortOnCategory = function(category){	
		var tempArr = this.results;
		if (category===1){
			tempArr.sort(
				function(a,b){
						return b.views-a.views;
				}
			);
		} else if (category===2){
			tempArr.sort(
				function(a,b){
						return b.durationSec - a.durationSec;
				}
			);
		} else if (category===3){
			tempArr.sort(
				function(a,b){
						return b.average - a.average;
				}
			);
		};

		for (var i = 0; i < tempArr.length; ++i){
			this.generateResultDiv(tempArr[i]);
		}
	};


	//creates a new playlist if it does not exists
	FirstpageControllerIndex.prototype.toggleCreatePlaylistForm = function(){
		$(this.createFormEl).toggle(100);
	};

	FirstpageControllerIndex.prototype.submitPlaylist = function(){
		var selectTagEl = doc.getElementById("tag-select"),
			prop = {};

		prop.name = doc.getElementById("pname").value;
		prop.desc = doc.getElementById("pdescription").value;
		prop.freetag = doc.getElementById("pfreetag").value.replace("#","");
		prop.tag = selectTagEl.options[selectTagEl.selectedIndex].id

		this.Mediator.write("submitPlaylist", prop);
	};
	
	//creates a new video element and append it to the list
	FirstpageControllerIndex.prototype.generateResultDiv = function(playlist){
		var that = this,
			element = $(".list-item").clone()[0];
		
		element.className = "";
		element.className = "list-item playlist";
		element.setAttribute("href", "/playlists/" + playlist.name);		
		
		element.getElementsByClassName("name")[0].innerText = playlist.name;		
		element.getElementsByClassName("description")[0].innerText = playlist.description;		
		element.getElementsByClassName("category")[0].innerText = playlist.category;		
		element.getElementsByClassName("freetag")[0].innerText = playlist.freetag ? playlist.freetag : "";		
		element.getElementsByClassName("videos")[0].innerText = playlist.videos;		

		playlist.element = element;	
		this.results.push(playlist);	
		this.resultEl.appendChild(element);
	};

	FirstpageControllerIndex.prototype.clear = function(){
		var elements = doc.getElementsByClassName("active");
		for(var i = 0; i < elements.length; ++i){
			elements[i].className = elements[i].className.replace("active", "");
		};

		this.resultEl.innerHTML = "";
		this.results = [];
	};
	
})(window, document, jQuery);

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

		this.searchEl		= $("#search-playlists")
		.on("keyup", this.searchPlaylists.bind(this));

		$("#home").attr("href", "http://" + doc.domain);
		$("#home").attr("href", "http://" + doc.domain);
		
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
		
		$("#logo").animate({opacity: "toggle", height: "toggle"}, 1500, function() {
			that.getPlaylists("new");
		});
	};

	//searches for playlists with given query
	FirstpageControllerIndex.prototype.searchPlaylists = function(event){
		var query = this.searchEl.val(),
			that = this,
			obj;

		if (event.which == 13 && query.length>0) {
			//set obj to send to mediator
			obj = {
				"query" : query,
				"callback" : function(playlists){
					that.clear();
					for (var i = 0; i < playlists.length; ++i){
						that.generateResultDiv(playlists[i]);
					}	
				}
			};
	
			if (query.indexOf("#")!==0){
				this.Mediator.write("searchPlaylistsByName", obj);
			}else{
				obj.query = obj.query.replace("#", "");
				this.Mediator.write("searchPlaylistsByFreetag", obj);
			}
		}
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

	//submits the new playlist to the APIHandler to verify it
	FirstpageControllerIndex.prototype.submitPlaylist = function(){
		var selectTagEl = doc.getElementById("tag-select"),
			prop = {};

		prop.name = doc.getElementById("pname").value;
		prop.password = doc.getElementById("ppassword").value;
		prop.desc = doc.getElementById("pdescription").value;
		prop.freetag = doc.getElementById("pfreetag").value.replace("#","");
		prop.tag = selectTagEl.options[selectTagEl.selectedIndex].id;

		this.Mediator.write("submitPlaylist", prop);
	};
	
	//creates a new video element and append it to the list
	FirstpageControllerIndex.prototype.generateResultDiv = function(playlist){
		var that = this,
			element = $(".list-item").clone()[0];
	
		element.className = "";
		element.className = "list-item playlist";
		element.setAttribute("href", "/playlists/" + playlist.name);		
		element.id = "";	
		
		$(".name", element).text(playlist.name);		
		$(".description", element).text(playlist.description);		
		$(".category", element).text(playlist.category);		
		$(".freetag", element).text(playlist.freetag ? playlist.freetag : "-");		
		$(".videos", element).text(playlist.videos);		

		playlist.element = element;	
		this.results.push(playlist);	
		this.resultEl.appendChild(element);
	};

	//fades out and removes current divs
	FirstpageControllerIndex.prototype.clear = function(callback){
		var elements = doc.getElementsByClassName("active"),
			that = this,
			collection = doc.getElementsByClassName("playlist");
	
		$(collection).each(function(){
			$(this).animate({
				opacity: 0
			}, 500, "linear", function(){
				this.remove()
			});
		});
		
		for(var i = 0; i < elements.length; ++i){
			elements[i].className = elements[i].className.replace("active", "");
		};

		this.results = [];
	};

	var toggleResult = function(div){
		div.animate({opacity:'0'},"slow", function(){
			div.innerHTML = "";
    		div.animate({opacity:'1'},"slow");
		});
	};
	
})(window, document, jQuery);

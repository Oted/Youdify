(function(win, doc, $, undefined){
    "use strict";
	//the first to run when document is ready
    $(function(){
		$("#main-sidebar").toggle().toggle();	
		new FirstpageControllerIndex();	
	});

	var FirstpageControllerIndex = function(){	
		this.Mediator = require("../Mediator.js").Mediator;
		
		var APIHandler = require('../model/APIHandler.js').APIHandler;
		new APIHandler(this.Mediator);		
	
		this.initUi();
	};

	//bind and set attr on UI controls
	FirstpageControllerIndex.prototype.initUi = function(){
		this.createFormEl = doc.getElementById("create-new-playlist-div");
		
		$("#create-playlist")
		.on("click", this.toggleCreatePlaylistForm.bind(this))
		.attr("title","Create a new playlist");
	
		$("#submit")
		.on("click", this.submitPlaylist.bind(this))
		.attr("title","Save and submit the playlist");

		$("#sort-category-1")
		.on("click", function(){
			that.sortOnCategory(1);
		});
	};

	//sort the results
	AddVideoControllerIndex.prototype.sortOnCategory = function(category){	
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

		this.clear();
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
})(window, document, jQuery);

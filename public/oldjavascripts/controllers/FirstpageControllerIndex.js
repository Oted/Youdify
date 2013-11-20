(function(win, doc, $, undefined){
    "use strict";
	var BMAP = win.BMAP || {};
	
	//the first to run when document is ready
    $(function(){
		//stupid firefox
		$("#main-sidebar").toggle().toggle();
	
		new FirstpageControllerIndex();	
		new BMAP.APIHandler();
	});

	var FirstpageControllerIndex = function(){
		this.createFormEl = doc.getElementById("create-new-playlist-div");
		
		$("#create-playlist")
		.on("click", this.toggleCreatePlaylistForm.bind(this))
		.attr("title","Create a new playlist");
	
		$("#submit")
		.on("click", submitPlaylist.bind(this))
		.attr("title","Save and submit the playlist");
	};

	//creates a new playlist if it does not exists
	FirstpageControllerIndex.prototype.toggleCreatePlaylistForm = function(){
		console.log(this.createFormEl);;
		$(this.createFormEl).toggle(100);
	};

	var submitPlaylist = function(){
		var selectTagEl = doc.getElementById("tag-select"),
			prop = {};

		prop.name = doc.getElementById("pname").value;
		prop.desc = doc.getElementById("pdescription").value;
		prop.freetag = doc.getElementById("pfreetag").value.replace("#","");
		prop.tag = selectTagEl.options[selectTagEl.selectedIndex].id

		BMAP.Mediator.write("submitPlaylist", prop);
	};
	
	win.BMAP = BMAP;
})(window, document, jQuery);

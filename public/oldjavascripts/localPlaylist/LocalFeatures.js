(function(win, doc, $, undefined){
	"use strict";
	var BMAP = win.BMAP || {};

	var LocalFeatures = function(){
		$("#create-playlist").attr("title",
			"Create a new playlist"		
		);
		
		this.searchEl       = $("#search").on("keypress", this.searchKeypress.bind(this));
	};

	//triggers when enter is pressed in searchEl
	LocalFeatures.prototype.searchKeypress = function(event){
		if (event.which == 13) {
			var results = BMAP.VideoController.getResults();
			BMAP.VideoController.clear();
			var query = this.searchEl.val();
			
			//if radiobutton is on playlist, the search searches for playlists
			if (!$("#search-option").is(":checked")){
				BMAP.SearchMachine.loadPlaylists(query,function(playlists){
					BMAP.SearchMachine.getVideosFromPlaylists(playlists, function(video){
						for (var i=0; i < results.length; i++){
							var found = false;
							if (results[i].id === video.id){
								found=true;
								break;
							}
						}
					
						if (!found && video.title!=="Private video"){
							results.push(video);
							BMAP.VideoController.generateResultDiv(video);
						}
					});	
				});
			}

			//if radiobutton is on videos we do a normal search
			else{
				BMAP.SearchMachine.loadVideos(query,function(video){
					for (var i=0; i < results.length; i++){
							var found = false;
							if (results[i].id === video.id){
								found=true;
								break;
							}
						}
					
						if (!found && video.title!=="Private video"){
							results.push(video);
							BMAP.VideoController.generateResultDiv(video);
						}
		
				});
			}
		};
	};

	BMAP.LocalFeatures = LocalFeatures;
	win.BMAP = BMAP;
})(window, document, jQuery);

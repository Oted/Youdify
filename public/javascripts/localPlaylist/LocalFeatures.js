(function(win, doc, $, undefined){
	"use strict";
	var BMAP = win.BMAP || {};

	var LocalFeatures = function(){
		$("#create-playlist").attr("title",
			"Creates a new playlist and attach it to this view, videos can then be pushed into the new playlist"		
		);
		
		$("#attach-playlist").attr("title",
			"Attach an existing playlist to this view given the name, videos can then be pushed into the attached playlist"		
		);
		
		$("#attached-playlist").attr("title",
			"Opens the attached playlist in a new tab, all videos pushed from this view will appear in the shared playlist"		
		);

		this.searchEl       = $("#search").on("keypress", this.searchKeypress.bind(this));
   		this.constraintEl   = $("#constraints").on("keyup", this.constrKeypress.bind(this));
	};

	//triggers when enter is pressed in searchEl
	LocalFeatures.prototype.searchKeypress = function(event){
		if (event.which == 13) {
			var results = BMAP.VideoController.getResults();
			BMAP.VideoController.clear();
			var query = this.searchEl.val();
			
			//if radiobutton is on playlist, the search searches for playlists
			if (false){
				BMAP.MessageBoard.putTemporary("Searching for playlists with " + query);
				
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
	
	//triggers when constraints keyup
	LocalFeatures.prototype.constrKeypress = function(event){
		var results = BMAP.VideoController.getResults();
		var key = event.which;
		var backspace = key == 8;
		var constraints = this.constraintEl.val().split(",");
		var constraint = constraints[constraints.length - 1];
			
		if (constraint.length == 0 && constraints.length ==0){
			$(".video").show();
			return;
		}

		//triggers when we are inbetween two keywords
		if (constraint.length == 0){
			//input box is empty
			if (constraints.length <= 1){
				results.forEach(function(video){
					if (BMAP.VideoController.isHidden(video)){
						video.element.show();
					}
				});
				return;
			}
			else{
				backspace = true;
			}
		}

		if (constraint.indexOf("-")==0){
			constraint = constraint.replace("-","");
				if(constraint.length!==0){
					results.forEach(function(video){
						if (video.title.toLowerCase().indexOf(constraint) !== -1){
							video.element.hide();
						}else if (backspace){
							video.element.show();
						}
					});
				}
		}
		else if (constraint.indexOf("+")==0){
			constraint = constraint.replace("+","");
			if(constraint.length!==0){
				results.forEach(function(video){
					if (video.title.toLowerCase().indexOf(constraint) == -1){
						video.element.hide();
					}else if (backspace){
						video.element.show();
					}
				});
			}
		}
	};

	BMAP.LocalFeatures = LocalFeatures;
	win.BMAP = BMAP;
})(window, document, jQuery);

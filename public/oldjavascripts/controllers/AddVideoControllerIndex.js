(function(win, doc, $, undefined){
    "use strict";
	var BMAP = win.BMAP || {};
	
	//the first to run when document is ready
    $(function(){
		var playlistName = doc.getElementById("name-div").value;
		//stupid firefox bug
		$("#main-sidebar").toggle().toggle();

		new AddVideoControllerIndex();	
		
		new BMAP.YoutubePlayer(280,200);
		new BMAP.SearchMachine();
		new BMAP.APIHandler(playlistName);
	});

	var AddVideoControllerIndex = function(){
		this.resultEl       = $("#overlay-search-results");
	
		this.searchEl       = $("#search")
		.on("keypress", this.searchKeypress.bind(this));

   		this.constraintEl   = $("#constraints")
		.on("keyup", this.constrKeypress.bind(this))
		.attr("title","By typing here you sort out what is shown in the list");
		
		this.searchOptionEl = $("#search-option")
		.attr("title","Video search is the standard search, playlistsearch is better when searcrching for albums or collections of videos");

		BMAP.Mediator.subscribe("resultsChange", resultsChange.bind(this));
		
		this.results 		= [];
	};
	
	//update results when it changes
	var resultsChange = function(results){
		this.results = results;
	};

	//generates a template for a video element
	var generateTemplate = function(){
		var element 	= doc.createElement("div"),
			thumbDiv 	= doc.createElement("div"),
			subTitleDiv = doc.createElement("div"),
			add 		= doc.createElement("button"),
			title 		= doc.createElement("h3"),
			thumb 		= doc.createElement("img");

		$(element).addClass("video");

		$(thumbDiv).addClass("grid-1")
		.appendTo(element);
	
		$(title).addClass("title grid-6")
		.appendTo(element);

		$(thumb).addClass("thumb grid-1")
		.appendTo(thumbDiv);
	
		$(add).addClass("grid-1 add-to-playlist")
		.html("Add")
		.attr("title", "Add this video to the playlist")
		.appendTo(thumbDiv);
	
		$(subTitleDiv).addClass("subtitle")
		.appendTo(element);

		return element;
	};

	//triggers when enter is pressed in searchEl
	AddVideoControllerIndex.prototype.searchKeypress = function(event){
		var query = this.searchEl.val(),
			that = this,
			object ={
				query : query, 
				callback : function(video){ 
					var found = that.checkIfExist(video);
					if (!found && video.title!=="Private video"){
						that.generateResultDiv(video);
					}
				}
			}

		if (event.which == 13) {
			this.clear();

			//if radiobutton is on playlist, the search searches for playlists
			if (!this.searchOptionEl.is(":checked")){
				BMAP.Mediator.write("loadPlaylists", object);
			}

			//if radiobutton is on videos we do a normal search
			else{
				BMAP.Mediator.write("loadVideos", object);
			}
		}
	};
	
	//check if a specific videoId exist in results array
	AddVideoControllerIndex.prototype.checkIfExist = function(video){
		var found = false;
		for (var i = 0; i < this.results.length; i++){
			if (video.id === this.results[i].id){
				found = true;
			};
		}
		return found;
	};

	
	//triggers when constraints keyup
	AddVideoControllerIndex.prototype.constrKeypress = function(event){
		var key = event.which,
			that = this,
			backspace = key == 8,
			constraints = this.constraintEl.val().split(","),
			constraint = constraints[constraints.length - 1];
			
		if (constraint.length == 0 && constraints.length ==0){
			$(".video").show();
			return;
		}

		//triggers when we are inbetween two keywords
		if (constraint.length == 0){
			//input box is empty
			if (constraints.length <= 1){
				that.results.forEach(function(video){
					if (isHidden(video)){
						show(video);
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
					this.results.forEach(function(video){
						if (video.title.toLowerCase().indexOf(constraint) !== -1){
							hide(video);
						}else if (backspace){
							show(video);
						}
					});
				}
		}
		else {
			constraint = constraint.replace("+","");
			if(constraint.length!==0){
				this.results.forEach(function(video){
					if (video.title.toLowerCase().indexOf(constraint) == -1){
						hide(video);
					}else if (backspace){
						show(video);
					}
				});
			}
		}
	};

	var hide = function(video){
		return $(video.element).hide();
	}	

	var show = function(video){
		return $(video.element).show();
	}	

	var isHidden = function(video){
		return video.element.style.display === "none";
	}	

	//clears result and all the video-elements
	AddVideoControllerIndex.prototype.clear = function(){
		$(this.resultEl).empty();
		this.results = [];
		BMAP.Mediator.write("resultsChange", this.results);
	};
	
	//creates a new video element and append it to the list
	AddVideoControllerIndex.prototype.generateResultDiv = function(video){
		this.results.push(video);
		BMAP.Mediator.write("resultsChange", this.results);
		
		var element = generateTemplate();
		
        $(element).find(".title")
		.html(video.title).on("click", function(){
			BMAP.Mediator.write("play", video);	
		});

        //add action for +P
        $(element).find(".add-to-playlist").on("click", function(){
			this.style.display = "none";
            BMAP.Mediator.write("pushVideo", video);
        });
	
		//set properties of video element
		$(element).find(".thumb").attr("src", video.thumb);
		$("<h4></h4>").text(video.category).appendTo($(element).find(".subtitle"));
		$("<h4></h4>").text("Duration : " + video.duration).appendTo($(element).find(".subtitle"));
		$("<h4></h4>").text("Views : " + video.views).appendTo($(element).find(".subtitle"));
		$("<h4></h4>").text("Likes : " + video.likes).appendTo($(element).find(".subtitle"));
		$("<h4></h4>").text("Dislikes : " + video.dislikes).appendTo($(element).find(".subtitle"));
	
		video.element = element;
		this.resultEl.append(element);
	};

	BMAP.AddVideoControllerIndex = AddVideoControllerIndex;
	win.BMAP = BMAP;
})(window, document, jQuery);

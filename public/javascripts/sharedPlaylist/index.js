(function(win, doc, $, undefined){
    "use strict";
	var BMAP = win.BMAP || {};
	
	//the first to run when document is ready
    $(function(){
		//stupid firefox bugfix
		$("#main-sidebar").toggle().toggle();

		var templateEl = generateTemplate();
		var resultEl       		= $("#search-results");	
		BMAP.YoutubePlayer		= new BMAP.YoutubePlayer(280,200);		
		BMAP.VideoController	= new BMAP.VideoController(templateEl, resultEl);		
		BMAP.SharedFeatures		= new BMAP.SharedFeatures();		
		BMAP.SearchMachine		= new BMAP.SearchMachine();		
		BMAP.PlaylistSocket		= new BMAP.PlaylistSocket();
		BMAP.MessageBoard		= new BMAP.MessageBoard();
	});

	var generateTemplate = function(){
		var element = doc.createElement("div"),
			thumbDiv = doc.createElement("div"),
			subTitleDiv = doc.createElement("div"),
			queue = doc.createElement("button"),	
			hide = doc.createElement("button"),	
			title = doc.createElement("h3"),
			thumb = doc.createElement("img");

		$(element).addClass("video");

		$(thumbDiv).addClass("grid-1")
		.appendTo(element);
	
		$(title).addClass("title grid-6")
		.appendTo(element);

		$(thumb).addClass("thumb grid-1")
		.appendTo(thumbDiv);
	
		$(queue).addClass("grid-1 add-to-queue")
		.html("Queue")
		.attr("title", "Add this video to the que")
		.appendTo(thumbDiv);
	
		$(hide).addClass("grid-1 hide-video")
		.html("Remove")
		.attr("title", "Remove this video from the list, the video will still be in the list efter refresh")
		.appendTo(thumbDiv);

		$(subTitleDiv).addClass("subtitle")
		.appendTo(element);

		return element;
	};


	win.BMAP = BMAP;
})(window, document, jQuery);

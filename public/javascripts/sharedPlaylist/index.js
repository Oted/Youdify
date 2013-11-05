(function(win, doc, $, undefined){
    "use strict";
	var BMAP = win.BMAP || {};
	
	//the first to run when document is ready
    $(function(){
		var templateEl = generateTemplate();
		var resultEl       = $("#search-results");	
		BMAP.YoutubePlayer		= new BMAP.YoutubePlayer(280,200);		
		BMAP.VideoController	= new BMAP.VideoController(templateEl, resultEl);		
		BMAP.SharedFeatures		= new BMAP.SharedFeatures();		
		BMAP.PlaylistSocket		= new BMAP.PlaylistSocket();
		BMAP.MessageBoard		= new BMAP.MessageBoard();
	});

	var generateTemplate = function(){
		var element = doc.createElement("div"),
			thumbDiv = doc.createElement("div"),
			subTitleDiv = doc.createElement("div"),
			queue = doc.createElement("button"),	
			title = doc.createElement("h3"),
			thumb = doc.createElement("image");

		$(element).addClass("video");

		$(thumbDiv).addClass("grid-1")
		.appendTo(element);
	
		$(title).addClass("title grid-6")
		.appendTo(element);

		$(thumb).addClass("thumb grid-1")
		.appendTo(thumbDiv);
	
		$(queue).addClass("add-to-queue grid-1")
		.html("Add2Q")
		.appendTo(thumbDiv);

		$(subTitleDiv).addClass("grid-6 subtitle")
		.appendTo(element);

		return element;
	};


	win.BMAP = BMAP;
})(window, document, jQuery);

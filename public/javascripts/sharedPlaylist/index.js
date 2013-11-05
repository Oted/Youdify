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
		var element = doc.createElement("div");
		$(element).addClass("video");
	
		var queue = doc.createElement("button");	
		$(queue).addClass("add add-to-queue")
		.html("+Q")
		.appendTo(element);

		var title = doc.createElement("h3");
		$(title).addClass("title")
		.appendTo(element);
		
		return element;
	};


	win.BMAP = BMAP;
})(window, document, jQuery);

(function(win, doc, $, undefined){
    "use strict";
	var BMAP = win.BMAP || {};
	
	//the first to run when document is ready
    $(function(){
		var templateEl = generateTemplate();

		BMAP.YoutubePlayer = new BMAP.YoutubePlayer(280,200);
		BMAP.VideoController = new BMAP.VideoController(templateEl);
		BMAP.LocalFeatures = new BMAP.LocalFeatures();
		BMAP.SearchMachine = new BMAP.SearchMachine();
		BMAP.PlaylistHandler = new BMAP.PlaylistHandler();
		BMAP.MessageBoard = new BMAP.MessageBoard();
	});

	var generateTemplate = function(){
		var element = doc.createElement("div");
		$(element).addClass("video");
	
		var playlist = doc.createElement("button");	
		$(playlist).addClass("add add-to-playlist")
		.html("+P")
		.appendTo(element);
		
		var title = doc.createElement("h3");
		$(title).addClass("title")
		.appendTo(element);

		return element;
	};

	win.BMAP = BMAP;
})(window, document, jQuery);

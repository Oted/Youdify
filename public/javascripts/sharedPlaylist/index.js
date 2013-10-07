(function(win, doc, $, undefined){
    "use strict";
	var BMAP = win.BMAP || {};
	
	//the first to run when document is ready
    $(function(){
		var templateEl = generateTemplate();

		BMAP.YoutubePlayer		= new BMAP.YoutubePlayer(280,200);		
		BMAP.VideoController	= new BMAP.VideoController(templateEl);		
		BMAP.PlaylistSocket		= new BMAP.PlaylistSocket();
		BMAP.MessageBoard		= new BMAP.MessageBoard();
	});

	var generateTemplate = function(){
		var element = doc.createElement("div");
		$(element).addClass("video");
	
		var title = doc.createElement("h3");
		$(title).addClass("title")
		.appendTo(element);

		var queue = doc.createElement("button");	
		$(queue).addClass("add add-to-queue")
		.html("+Q")
		.appendTo(element);

		var duration = doc.createElement("h3");
		$(duration).addClass("add duration")
		.appendTo(element);

		var views = doc.createElement("h3");
		$(views).addClass("add views")
		.appendTo(element);

		var cat  = doc.createElement("h3");
		$(cat).addClass("add cat")
		.appendTo(element);

		return element;
	};


	win.BMAP = BMAP;
})(window, document, jQuery);

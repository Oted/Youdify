(function(win, doc, $, undefined){
    "use strict";
	var BMAP = win.BMAP || {};

	//the first to run when document is ready
    $(function(){
		var templateEl = generateTemplate(),
				resultEl   = $("#overlay-search-results"),

				YoutubePlayer 		= new BMAP.YoutubePlayer(280,200),
				VideoController 	= new BMAP.VideoController(templateEl,resultEl),
				LocalFeatures 		= new BMAP.LocalFeatures(),
				SearchMachine 		= new BMAP.SearchMachine(),
				PlaylistHandler   = new BMAP.PlaylistHandler();

		ko.applyBindings(PlaylistHandler);
	});

	win.BMAP = BMAP;
})(window, document, jQuery);

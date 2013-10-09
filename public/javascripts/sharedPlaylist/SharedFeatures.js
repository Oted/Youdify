(function(win, doc, $, undefined){
	"use strict";
	var BMAP = win.BMAP || {};

	var SharedFeatures = function(){	
		this.addNewToQueEl	= $("#addNewToQue").on("click", this.toggleAddNewToQue.bind(this)).attr("title",
			"Toggle add new to queue, if this is enabled videos pushed by anyone will be added to queue and played automatically"		
		);

		this.addNewToQue = false;
	};	

	//toggle addNewToQue (add pushed songs to queue)
	SharedFeatures.prototype.toggleAddNewToQue = function(){
		$(this.addNewToQueEl).toggleClass("active");
		
		this.addNewToQue = !this.addNewToQue;
		if (this.addNewToQue){
			BMAP.MessageBoard.putTemporary("Add new to queue is now on");
		}
		else {
			BMAP.MessageBoard.putTemporary("Add new to queue is now off");
		}
		//code for animations here
		return false;
	};

	BMAP.SharedFeatures = SharedFeatures;
	win.BMAP = BMAP;
})(window, document, jQuery);

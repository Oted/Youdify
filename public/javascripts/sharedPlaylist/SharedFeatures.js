(function(win, doc, $, undefined){
	"use strict";
	var BMAP = win.BMAP || {};

	var SharedFeatures = function(){	
		var that = this;
		
		//load the iframe
		$("#overlay-wrapper").load(function () {
			$("#close-add-video", frames["overlay-wrapper"].document).on("click", that.toggleAddVideo.bind(this)).attr("title",
				"Go back to the playlist"
			);
		});

		this.addVideoEl = $("#add-video").on("click", this.toggleAddVideo.bind(this)).attr("title",
			"Add new video to the playlist"		
		);

		this.emptyQueEl	= $("#empty-queue").on("click", this.emptyQueue.bind(this)).attr("title",
			"Empty the queue"		
		);

		this.addNewToQueEl = $("#add-new-to-queue").on("click", this.toggleAddNewToQue.bind(this)).attr("title",
			"Toggle add new to queue, if this is enabled videos pushed by anyone will be added to queue and played automatically"		
		);

		this.addNewToQue = false;
	};	

	//empty the queue
	SharedFeatures.prototype.emptyQueue = function(){
		BMAP.YoutubePlayer.emptyQueue();
	};

	//back and forth between adding videos and playlist
	SharedFeatures.prototype.toggleAddVideo = function(){
		if ($("#overlay-wrapper").is(":visible")){	
			$("#overlay-wrapper").toggle(400,function(){
				$("body").css("background", "#262626");
				$("#main-wrapper").toggle(400);	
			});	
		}
		else{
			$("#main-wrapper").toggle(400,function(){
				$("body").css("background", "grey");
				$("#overlay-wrapper").toggle(400);	
			});	
		}
	};

	//returns the bool addNewToQue
	SharedFeatures.prototype.getAddNewToQue = function(){
		return this.addNewToQue;
	};
			
	//toggle addNewToQue (add pushed songs to queue)
	SharedFeatures.prototype.toggleAddNewToQue = function(){
		$(this.addNewToQueEl).toggleClass("active");
		
		this.addNewToQue = !this.addNewToQue;
		if (this.addNewToQue){
			BMAP.MessageBoard.putTemporary("New videos will now be added to this queue");
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

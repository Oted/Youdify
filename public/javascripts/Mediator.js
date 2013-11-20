(function(){
  "use strict";
  var Mediator = function(){
    var subscribers = {},

      subscribe = function (event, callback) {
		if (typeof subscribers[event] === "undefined") {
          subscribers[event] = [];
        }

        subscribers[event].push(callback);
      },

      write = function (event, object) {
	  	var i = 0,
        	events = subscribers[event],
        	current;

        if (typeof events !== "undefined") {
          for (i = events.length; i >= 0; i--) {
            current = events[i];
            if (typeof current === "function") {
              current(object);
            }
          }
        }
	  };

      return {
        subscribe: subscribe,
        write: write
      };
  };
  
  exports.Mediator = new Mediator();
}(window));

var LocalStrategy = require("passport-local").Strategy,
	dbHandler = require("../model/playlist.js"),
	passport = require("passport"),
	authu = [];

//init passport local strategy
passport.use(new LocalStrategy(
		function(username, password, done){
		dbHandler.checkIfExist(username, function(obj){
			var playlist = obj.doc;
			if (!obj.found) {
				return done(null, false);
			} 
			if (!obj.doc){
				return done(null, false);
			}
			dbHandler.verifyPassword(password, playlist.password, function(isMatch){
				if (!isMatch){
					return done(null, false);
				}
				else{
					return done(null, playlist);
				}
			});
		});
	}
));

//serialize new session for user
passport.serializeUser(function(playlist, done) {
	done(null, playlist.name);
});

//deserialize the session for the user
passport.deserializeUser(function(name, done) {
	dbHandler.checkIfExist(name, function(obj) {
		if (obj.doc){
			done(null, obj.doc);
		}else{
			done(null, false);
		}
	});
});

exports.add = function(sessionId, playlistName){
	console.log("New authenticated session " + sessionId + " bound to " + playlistName);
	authu.unshift({"sessionId":sessionId, "playlistName":playlistName})
	authu.slice(0,100);
};

//is the client authenticated?
exports.isAuthenticated = function(session, name){
	var auth = false, 
		obj;
	
	for (var i = 0; i < authu.length; i++){
		obj = authu[i];
		if (obj.sessionId === session && obj.playlistName===name){
			auth = true;
		}
	}
	return auth;
};

module.exports = function(){
	var RateLimiter = require('limiter').RateLimiter,
		limiter = new RateLimiter(60, "minute", true);

	return function(req, res, next){
		console.log("lol");
		limiter.removeTokens(1, function(err, remainingRequests) {
			if (remainingRequests < 0) {
				res.writeHead(429, {'Content-Type': 'text/plain;charset=UTF-8'});
				res.end('429 Too Many Requests - your IP is being rate limited');
			} else {
				next();
			}
		});
	};
};

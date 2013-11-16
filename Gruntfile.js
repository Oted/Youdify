module.exports = function(grunt){
	grunt.initConfig({
		browserify : {
			default : {
				files : {
					"public/javascripts/script.js" : ["public/javascripts/sharedPlaylist/index.js"] 
				}	
			}
		},
		watch : {
			script : {
				files : ["public/javascripts/**/*.js"],
				tasks : ["browserify"]
			}
		}

	});
	grunt.loadNpmTasks("grunt-browserify");
	grunt.loadNpmTasks("grunt-contrib-watch");
	grunt.registerTask("default",["browserify"]);
};

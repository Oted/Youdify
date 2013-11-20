module.exports = function(grunt){
	grunt.initConfig({
		compass: {
    		dist: {             
     			options: {       
        			config: "config.rb"
      			}
    		}
		},
		browserify : {
			default : {
				files : {
					"public/FirstpageScript.js" : 	["public/javascripts/controllers/FirstpageControllerIndex.js"],
					"public/AddVideoScript.js" : 	["public/javascripts/controllers/AddVideoControllerIndex.js"],
					"public/PlaylistScript.js" : 	["public/javascripts/controllers/PlaylistControllerIndex.js"]
				}	
			}
		},
		watch : {
			script : {
				files : ["public/javascripts/**/*.js"],
				tasks : ["browserify"]
			},
			options: {
         	   livereload: 1337,
			   atBegin : true
        	},
        	css: {
          		files: ['sass/**/*.scss'],
          		tasks: ['compass']
        	}
		}
	});

	grunt.loadNpmTasks("grunt-browserify");
	grunt.loadNpmTasks("grunt-contrib-watch");
	grunt.registerTask("default",["browserify","compass"]);
	grunt.loadNpmTasks('grunt-contrib-compass');
};

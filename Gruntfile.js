/*global module:false*/
module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({

    dirs: {
      base: './src/'
    },

    // Metadata.
    pkg: grunt.file.readJSON('package.json'),
    banner: '/*! <%= pkg.title || pkg.name %> - v<%= pkg.version %> - ' +
      '<%= grunt.template.today("yyyy-mm-dd") %>\n' +
      '<%= pkg.homepage ? "* " + pkg.homepage + "\\n" : "" %>' +
      '* Copyright (c) <%= grunt.template.today("yyyy") %> <%= pkg.author.name %>;' +
      ' Licensed <%= _.pluck(pkg.licenses, "type").join(", ") %> */\n',
    // Task configuration.
    browserify: {
        dist: {
            options: {
               transform: [
                  ["babelify", {
                     loose: "all"
                  }]
               ]
            },
            files: {
               // if the source file has an extension of es6 then
               // we change the name of the source file accordingly.
               // The result file's extension is always .js
               "<%= dirs.base %>dist/bundle.js": ["<%= dirs.base %>js/**.js"]
            }
        }
    },
    connect: {
      web: {
        options:  {
          port: 3000,
          hostname: '127.0.0.1',
          base: 'src',
          keepalive: true
        }
      }
    },
    less: {
        main: {
            options: {
                ieCompat: false
            },
            files: {
                '<%= dirs.base %>css/build.css': ['<%= dirs.base %>less/*.less']
            }
        }
    },
    watch: {
        scripts: {
           files: ["<%= dirs.base %>js/**/*.js"],
           tasks: ["browserify"]
       },
       less: {
           files: ["<%= dirs.base %>less/*.less"],
           tasks: ["less"]
       }
    }
  });

  // These plugins provide necessary tasks.
  grunt.loadNpmTasks("grunt-browserify");
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-less');
  grunt.loadNpmTasks('grunt-contrib-connect');

  // Default task.
  grunt.registerTask("default", ["watch"]);
  grunt.registerTask("build", ["browserify", "less"]);

};

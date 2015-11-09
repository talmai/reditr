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
                    browserifyOptions:{ debug: true },
                    transform: [
                        ["babelify", {
                            loose: "all"
                        }]
                    ]
                },
                files: {
                    "<%= dirs.base %>dist/bundle.js": ["<%= dirs.base %>js/**.js"]
                }
            },
            watch: {
                options: {
                    watch: true,
                    keepAlive: true,
                    browserifyOptions:{ debug: true },
                    transform: [
                        ["babelify", {
                            loose: "all"
                        }]
                    ]
                },
                files: {
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
                    keepalive: true,
                    middleware: function(connect, options, wares) {
                        wares.unshift(function(req, res, next) {
                            var filename = './src' + req.url;
                            return !grunt.file.exists(filename) || filename == './src/' ? res.end(grunt.file.read('./src/index.html')) : next();
                        });
                        return wares;
                    }
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
            less: {
                files: ["<%= dirs.base %>less/*.less"],
                tasks: ["less"]
            }
        },
        concurrent: {
            watch: ['browserify:watch', 'watch:less', 'connect']
        }
    });

    // These plugins provide necessary tasks.
    require('load-grunt-tasks')(grunt);

    // Default task.
    grunt.registerTask("default", ["concurrent:watch"]);
    grunt.registerTask("build", ["browserify:dist", "less"]);

};

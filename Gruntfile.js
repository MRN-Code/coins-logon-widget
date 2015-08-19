/* jshint node:true */
'use strict';

module.exports = function(grunt) {
    require('load-grunt-tasks')(grunt);

    grunt.initConfig({
        config: {
            distDir: 'dist',
            examplesDir: 'examples',
            scriptsDir: 'scripts',
            stylesDir: 'styles',
            tempDir: '.tmp'
        },
        browserify: {
            dist: {
                files: {
                    '<%= config.distDir %>/coins-logon-widget.js': '<%= config.scriptsDir %>/coins-logon-widget.js'
                }
            }
        },
        clean: ['<%= config.tempDir %>', '<%= config.distDir %>'],
        connect: {
            options: {
                hostname: 'localhost',
                livereload: 35729,
                port: 9000,
            },
            livereload: {
                options: {
                    base: [
                        'node_modules',
                        '<%= config.destDir %>',
                        '<%= config.examplesDir %>'
                    ],
                    open: true
                }
            }
        },
        csso: {
            options: {
                banner: '/* coins-logon-widget */\n'
            },
            dist: {
                expand: true,
                cwd: '<%= config.distDir %>/',
                src: ['*.css', '!*.min.css'],
                dest: '<%= config.distDir %>/',
                ext: '.min.css'
            }
        },
        postcss: {
            options: {
                map: true, // Inline sourcemap
                processors: [
                    require('autoprefixer-core')({ browsers: 'last 3 versions' })
                ]
            },
            dist: {
                files: [{
                    expand: true,
                    cwd: '.tmp',
                    src: '*.css',
                    dest: '<%= config.distDir %>/'
                }]
            },
        },
        sass: {
            options: {
                sourceMap: true,
                sourceMapEmbed: true,
                sourceMapContents: true,
                includePaths: ['.']
            },
            dist: {
                files: [{
                    expand: true,
                    cwd: '<%= config.stylesDir %>',
                    src: ['*.scss'],
                    dest: '.tmp/',
                    ext: '.css'
                }]
            }
        },
        requirejs: {
            dist: {
                options: {
                    baseUrl: 'node_modules',
                    include: [
                        'coins-logon-widget/scripts/coins-logon-widget'
                    ],
                    out: 'dist/coins-logon-widget.js',
                    optimize: 'none',
                    paths: {
                        'coins-logon-widget': '../',
                        'unique-number': 'unique-number/index'
                    }
                }
            }
        },
        uglify: {
            options: {
                mangle: true
                // screwIE8: true
            },
            dist: {
                files: {
                    '<%= config.distDir %>/coins-logon-widget.min.js' : ['<%= config.distDir %>/*.js']
                }
            }
        },
        watch: {
            css: {
                files: '.tmp/*.css',
                tasks: ['postcss']
            },
            sass: {
                files: '<%= config.stylesDir %>/**/*.scss',
                tasks: ['sass']
            },
            js: {
                files: '<%= config.scriptsDir %>/**/*.js',
                tasks: ['requirejs']
            },
            livereload: {
                options: {
                    livereload: '<%= connect.options.livereload %>'
                },
                files: [
                    '<%= config.distDir %>/*.{css,js}',
                    '<%= config.examplesDir %>/**/*'
                ]
            }
        }
    });

    grunt.registerTask('default', ['clean', 'sass', 'postcss', 'requirejs']);
    grunt.registerTask('build', ['default', 'csso', 'uglify']);
    grunt.registerTask('serve', ['default', 'connect', 'watch']);
};

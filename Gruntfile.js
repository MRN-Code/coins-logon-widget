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
        clean: ['<%= config.tempDir %>', '<%= config.distDir %>'],
        connect: {
            options: {
                hostname: 'localcoin.mrn.org',
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
                    require('autoprefixer')({ browsers: 'last 3 versions' })
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
        sed: {
            requirejs: {
                pattern: /\ndefine\("hawk.*\n/g,
                replacement: '\n',
                recursive: true,
                path: '<%= config.distDir %>'
            }
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
                        'es6-object-assign': 'es6-object-assign/dist/object-assign',
                        'unique-number': 'unique-number/index'
                    }
                }
            }
        },
        uglify: {
            dist: {
                files: {
                    '<%= config.distDir %>/coins-logon-widget.min.js' : [
                        '<%= config.distDir %>/coins-logon-widget.js'
                    ]
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
                tasks: ['requirejs', 'sed']
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

    grunt.registerTask('default', ['clean', 'sass', 'postcss', 'requirejs', 'sed']);
    grunt.registerTask('build', ['default', 'csso', 'uglify']);
    grunt.registerTask('serve', ['default', 'connect', 'watch']);
};

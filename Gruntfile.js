/* jshint node:true */
'use strict';

module.exports = function(grunt) {
    require('load-grunt-tasks')(grunt);

    grunt.initConfig({
        config: {
            distDir: 'dist',
            examplesDir: 'examples',
            scriptsDir: 'scripts',
            stylesDir: 'styles'
        },
        babel: {
            options: {
                sourceMaps: 'inline',
                stage: 0
            },
            dist: {
                files: [{
                    expand: true,
                    cwd: '<%= config.scriptsDir %>/',
                    src: '*.js',
                    dest: '<%= config.distDir %>/'
                }]
            }
        },
        clean: ['.tmp', '<%= config.distDir %>'],
        connect: {
            options: {
                hostname: 'localhost',
                livereload: 35729,
                port: 9000,
            },
            livereload: {
                options: {
                    base: [
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
                tasks: ['babel']
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

    grunt.registerTask('default', ['clean', 'sass', 'postcss', 'babel']);
    grunt.registerTask('build', ['default', 'csso']);
    grunt.registerTask('serve', ['default', 'connect', 'watch']);
};

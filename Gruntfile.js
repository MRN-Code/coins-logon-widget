/* jshint node:true */
'use strict';

module.exports = function(grunt) {
    require('load-grunt-tasks')(grunt);

    grunt.initConfig({
        config: {
            distDir: 'dist',
            stylesDir: 'styles'
        },
        clean: ['.tmp', '<%= config.distDir %>'],
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
            }
        }
    });

    grunt.registerTask('default', ['clean', 'sass', 'postcss', 'watch']);
    grunt.registerTask('build', ['clean', 'sass', 'postcss']);
};

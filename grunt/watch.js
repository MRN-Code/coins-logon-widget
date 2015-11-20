'use strict';
module.exports = function(grunt) {
    return {
        css: {
            files: '.tmp/*.css',
            tasks: ['postcss']
        },
        sass: {
            files: grunt.config.get('stylesDir') + '/**/*.scss',
            tasks: ['sass']
        },
        js: {
            files: grunt.config.get('scriptsDir') + '/**/*.js',
            tasks: ['exec:webpack']
        },
        livereload: {
            options: {
                livereload: grunt.config.get('connect.options.livereload')
            },
            files: [
                grunt.config.get('distDir') + '/*.{css,js}',
                grunt.config.get('examplesDir') + '/**/*'
            ]
        }
    };
};

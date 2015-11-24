'use strict';
module.exports = function(grunt) {
    return {
        options: {
            map: true,

            // Inline sourcemap
            processors: [
                require('autoprefixer')({ browsers: 'last 3 versions' })
            ]
        },
        dist: {
            files: [{
                expand: true,
                cwd: '.tmp',
                src: '*.css',
                dest: grunt.config.get('distDir')
            }]
        },
    };
};

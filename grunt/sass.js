'use strict';
module.exports = function(grunt) {
    return {
        options: {
            sourceMap: true,
            sourceMapEmbed: true,
            sourceMapContents: true,
            includePaths: ['.']
        },
        dist: {
            files: [{
                expand: true,
                cwd: grunt.config.get('stylesDir'),
                src: ['*.scss'],
                dest: '.tmp/',
                ext: '.css'
            }]
        }
    };
};

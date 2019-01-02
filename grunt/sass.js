'use strict';
var sass = require('node-sass');
module.exports = function(grunt) {
    return {
        options: {
            sourceMap: true,
            sourceMapEmbed: true,
            sourceMapContents: true,
            includePaths: ['.'],
            implementation: sass
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

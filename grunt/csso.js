'use strict';
module.exports = function(grunt) {
    return {
        options: {
            banner: '/* coins-logon-widget */\n'
        },
        dist: {
            expand: true,
            cwd: grunt.config.get('distDir'),
            src: ['*.css', '!*.min.css'],
            dest: grunt.config.get('distDir'),
            ext: '.min.css'
        }
    };
};

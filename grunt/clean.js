'use strict';
module.exports = function(grunt) {
    return [grunt.config.get('tempDir'), grunt.config.get('distDir')];
};

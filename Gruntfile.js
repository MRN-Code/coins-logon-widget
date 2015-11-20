/* jshint node:true */
'use strict';

module.exports = function(grunt) {
    grunt.initConfig({
        distDir: 'dist',
        examplesDir: 'examples',
        scriptsDir: 'scripts',
        stylesDir: 'styles',
        tempDir: '.tmp'
    });
    require('load-grunt-tasks')(grunt);
    require('load-grunt-config')(grunt);

    grunt.registerTask('default', ['clean', 'sass', 'postcss']);
    grunt.registerTask('build', ['default', 'csso', 'exec:webpack']);
    grunt.registerTask('serve', ['default', 'connect', 'watch']);
};

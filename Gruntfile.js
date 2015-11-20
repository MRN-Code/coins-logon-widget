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

    grunt.registerTask('lint', ['jshint']); //, 'jscs']);
    grunt.registerTask('build', ['default', 'csso', 'exec:webpack']);
    grunt.registerTask('serve', ['default', 'connect', 'watch']);
    grunt.registerTask('test', ['exec:test']);
    grunt.registerTask('default', ['lint', 'test', 'clean', 'sass', 'postcss']);
};

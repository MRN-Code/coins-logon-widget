'use strict';
module.exports = function(grunt) {
    return {
        options: {
            hostname: 'localcoin.mrn.org',
            livereload: 35729,
            port: 9000,
        },
        livereload: {
            options: {
                base: [
                    'node_modules',
                    grunt.config.get('distDir'),
                    grunt.config.get('examplesDir'),
                ],
                open: true
            }
        }
    };
};

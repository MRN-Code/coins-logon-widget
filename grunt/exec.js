'use strict';
module.exports = function(grunt) {
    return {
        webpack: {
            command: 'webpack'
        },
        test: {
            command: 'node ./launch-tests.js'
        }
    };
};

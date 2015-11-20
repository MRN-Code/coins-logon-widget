'use strict';
module.exports = function(grunt) {
    return {
        webpack: {
            command: 'webpack'
        },
        test: {
            command: 'testem ci -P 5'
        }
    };
};

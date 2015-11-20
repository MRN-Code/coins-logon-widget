var path = require('path');
var webpack = require('webpack');

module.exports = {
    node: {
        fs: 'empty'
    },
    entry: {
        'test': './test/index.js'
    },
    output: {
        path: path.join(__dirname),
        filename: '[name].bundle.js',
    },
};

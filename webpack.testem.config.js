var path = require('path');
var webpack = require('webpack');

module.exports = {
    bail: true,
    node: {
        fs: 'empty'
    },
    entry: {
        'test': ['./test/index.js', './test/auth.js']
    },
    output: {
        path: path.join(__dirname),
        filename: '[name].bundle.js',
    },
};

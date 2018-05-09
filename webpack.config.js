var path = require('path');
var webpack = require('webpack');
var pkg = require('./package.json');

module.exports = {
    node: {
        fs: 'empty'
    },
    entry: {
        'coins-logon-widget': './scripts/coins-logon-widget.js'
    },
    output: {
        path: path.join(__dirname + '/dist'),
        filename: '[name].js',
        library: 'CoinsLogonWidget',
        libraryTarget: 'umd',
        umdNamedDefine: true,
    },
    optimization: {
        minimize: true
    }
};

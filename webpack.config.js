var path = require('path');
var webpack = require('webpack');
var DedupePlugin = webpack.optimize.DedupePlugin;
var DefinePlugin = webpack.DefinePlugin;
var UglifyJsPlugin = webpack.optimize.UglifyJsPlugin;
var pkg = require('./package.json');

var isDev = process.env.COINS_ENV === 'development';

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
    plugins: [
        new DefinePlugin({
            __VERSION__: JSON.stringify(pkg.version),
        }),
        new DedupePlugin()
    ].concat(isDev ? [
        new webpack.optimize.UglifyJsPlugin({
            sourceMap: false,
            compress: {
                warnings: false
            }
        })
    ] : [])
};

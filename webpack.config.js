/* jshint -W101 */ // permit long lines
var path = require('path');
var webpack = require('webpack');
var isDev = process.env.COINS_ENV === 'development';

module.exports = {
    entry: [
        'index.js'
    ].concat(isDev ? [
        'webpack-dev-server/client?http://localhost:3000',
        'webpack/hot/only-dev-server'
    ] : []),
    output: {
        path: isDev ? __dirname : __dirname + '/build',
        filename: 'bundle.js',
        publicPath: isDev ? 'http://localhost:3000/' : __dirname + '/app/build'
    },
    plugins: [
        new webpack.NoErrorsPlugin()
    ].concat(isDev ? [
        new webpack.HotModuleReplacementPlugin()
    ] : [
        new webpack.optimize.UglifyJsPlugin({ sourceMap: false })
    ]),
    resolve: {
        extensions: ['', '.js', '.jsx']
    },
    module: {
        loaders: [
            { test: /\.css$/, loader: 'style-loader!css-loader' },
            { test: /\.json$/, loader: 'json' },
            { test: /\.js?$/, loaders: ['babel?stage=0'] },
            { test: /\.scss$/, loader: 'style!css!sass?sourceMap' },
            { test: /\.svg(\?v=\d+\.\d+\.\d+)?$/, loader: 'url?limit=10000&minetype=image/svg+xml' },
            { test: /\.ttf(\?v=\d+\.\d+\.\d+)?$/, loader: 'url?limit=10000&minetype=application/octet-stream' },
            { test: /\.woff(\?v=\d+\.\d+\.\d+)?$/, loader: 'url?limit=10000&minetype=application/font-woff' },
            { test: /\.woff2(\?v=\d+\.\d+\.\d+)?$/, loader: 'url?limit=10000&minetype=application/font-woff' }
        ]
    }
};

var webpack = require('webpack');
module.exports = {
    entry: [
        './test/test.js'
    ],
    output: {
        filename: 'bundle.js'
    },
    plugins: [
        new webpack.NoErrorsPlugin()
    ],
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
    },
   browser: {
    fs: "empty"
   },
   node: {
    fs: 'empty'
   }
};
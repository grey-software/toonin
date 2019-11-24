const path = require('path');
const CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = {
    mode: "production",
    node: {
        fs: "empty"
    },
    module: {
        rules: [
            {
                test: /\.js$/,
                use: {
                    loader: "babel-loader"
                }
            },
            {
                test: /\.css$/,
                use: [
                    'style-loader',
                    'css-loader',
                ],
            }
        ]
    },
    output: {
        filename: "[name].js",
        path: path.resolve(__dirname, 'dist')
    },
    entry: {
        popup: './src/popup.js',
        background: './src/js/background/index.js',
        inject: './src/js/inject/index.js'
    },
    plugins: [
        new CopyWebpackPlugin([
            { from: 'src' }
        ])
    ]
}

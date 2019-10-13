const path = require('path');

module.exports = {
    mode: "development",
    node: {
        fs: "empty"
    },
    module: {
        rules: [{
            test: /\.js$/,
            use: {
                loader: "babel-loader"
            }
        }]
    }
}

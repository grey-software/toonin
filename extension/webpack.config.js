const path = require('path');

module.exports = {
    mode: "production",
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

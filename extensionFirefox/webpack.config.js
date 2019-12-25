const path = require('path');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const VueLoaderPlugin = require('vue-loader/lib/plugin')
const VuetifyLoaderPlugin = require('vuetify-loader/lib/plugin')

module.exports = {
    mode: "production",
    node: {
        fs: "empty"
    },
    module: {
        rules: [
            {
                test: /\.m?js$/,
                exclude: /(node_modules|bower_components)/,
                use: {
                    loader: 'babel-loader',
                    options: {
                        presets: ['@babel/preset-env']
                    }
                }
            }, {
                test: /\.css$/,
                use: ['style-loader', 'css-loader',]
            }, {
                test: /\.vue$/,
                use: ['vue-loader']
            }, {
                test: /\.(png|jpe?g|gif)$/i,
                use: [
                    {
                        loader: 'file-loader',
                        options: {
                            outputPath: 'img/',
                            name: '[name].[ext]',
                            publicPath: '/'
                        }
                    },
                ]
            }, {
                test: /\.(woff(2)?|ttf|eot|svg)(\?v=\d+\.\d+\.\d+)?$/,
                use: [
                    {
                        loader: 'file-loader',
                        options: {
                            name: '[name].[ext]',
                            outputPath: 'fonts/'
                        }
                    }
                ]
            }, {
                test: /\.s(c|a)ss$/,
                use: [
                    'vue-style-loader', 'css-loader', {
                        loader: 'sass-loader',
                        // Requires sass-loader@^7.0.0
                        options: {
                            implementation: require('sass'),
                            fiber: require('fibers'),
                            indentedSyntax: true // optional
                        },
                        // Requires sass-loader@^8.0.0
                        options: {
                            implementation: require('sass'),
                            sassOptions: {
                                fiber: require('fibers'),
                                indentedSyntax: true // optional
                            }
                        }
                    },
                ]
            },
        ]
    },
    entry: {
        app: './src/app.js',
        background: ["babel-polyfill", './src/js/background/index.js'],
        inject: ["babel-polyfill", './src/js/inject/index.js']
    },
    plugins: [
        new CopyWebpackPlugin(
            [{
                    from: 'src'
                }]
        ),
        new VueLoaderPlugin(),
        new VuetifyLoaderPlugin(
            { /**
     * This function will be called for every tag used in each vue component
     * It should return an array, the first element will be inserted into the
     * components array, the second should be a corresponding import
     *
     * originalTag - the tag as it was originally used in the template
     * kebabTag    - the tag normalised to kebab-case
     * camelTag    - the tag normalised to PascalCase
     * path        - a relative path to the current .vue file
     * component   - a parsed representation of the current component
     */
                match(originalTag, {kebabTag, camelTag, path, component}) {
                    if (kebabTag.startsWith('core-')) {
                        return [camelTag, `import ${camelTag} from '@/components/core/${
                                camelTag.substring(4)
                            }.vue'`]
                    }
                }
            }
        )
    ],
    output: {
        filename: "[name].js",
        path: path.resolve(__dirname, 'build'),
        publicPath: '/'
    }
}

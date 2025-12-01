const path = require('path');
const { VueLoaderPlugin } = require('vue-loader');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = (env, argv) => {
    const isProduction = argv.mode === 'production';
    
    return {
        entry: './src/main.ts',
        output: {
            path: path.resolve(__dirname, 'dist'),
            filename: 'weather-widget.js',
            library: 'WeatherWidget',
            libraryTarget: 'umd',
            globalObject: 'this',
            clean: true,
            publicPath: isProduction ? '' : '/'  // Empty for production, '/' for dev
        },
        resolve: {
            extensions: ['.ts', '.js', '.vue', '.json'],
            alias: {
                '@': path.resolve(__dirname, 'src'),
                'vue': 'vue/dist/vue.esm-bundler.js'
            }
        },
        module: {
            rules: [
                {
                    test: /\.vue$/,
                    loader: 'vue-loader'
                },
                {
                    test: /\.ts$/,
                    loader: 'ts-loader',
                    options: {
                        appendTsSuffixTo: [/\.vue$/]
                    }
                },
                {
                    test: /\.js$/,
                    loader: 'babel-loader',
                    exclude: /node_modules/
                },
                {
                    test: /\.scss$/,
                    use: [
                        'style-loader',
                        'css-loader',
                        {
                            loader: 'sass-loader',
                            options: {
                                api: 'modern',
                                sassOptions: {
                                    silenceDeprecations: ['legacy-js-api']
                                }
                            }
                        }
                    ]
                }
            ]
        },
        plugins: [
            new VueLoaderPlugin(),
            new HtmlWebpackPlugin({
                template: path.resolve(__dirname, 'public/index.html'),
                inject: 'body',  // Change from false to 'body'
                minify: isProduction ? {
                    removeComments: true,
                    collapseWhitespace: true
                } : false
            })
        ],
        externals: {
            // Uncomment if you want Vue to be external
            // 'vue': 'Vue'
        },
        devServer: {
            static: {
                directory: path.join(__dirname, 'public'),
            },
            port: 8080,
            open: true,
            hot: true
        }
    };
};

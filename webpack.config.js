var path = require('path')
var webpack = require('webpack')
var fs = require('fs')
const { VueLoaderPlugin } = require('vue-loader')

var rootPath = "/";

module.exports = {
  mode: 'production',
  entry: './src/main.js',
  output: {
    path: path.resolve(__dirname, './public/dist'),
    publicPath: rootPath + 'dist/',
    filename: 'build.js'
  },
  module: {
    rules: [
      {
        test: /\.css$/,
        use: [
          'style-loader',
          'css-loader'
        ],
      },
      {
        test: /\.scss$/,
        use: [
          'style-loader',
          'css-loader',
          'sass-loader'
        ],
      },
      {
        test: /\.sass$/,
        use: [
          'style-loader',
          'css-loader',
          'sass-loader?indentedSyntax'
        ],
      },
      {
        test: /\.vue$/,
        loader: 'vue-loader',
        options: {
          loaders: {
            // Since sass-loader (weirdly) has SCSS as its default parse mode, we map
            // the "scss" and "sass" values for the lang attribute to the right configs here.
            // other preprocessors should work out of the box, no loader config like this necessary.
            'scss': [
              'style-loader',
              'css-loader',
              'sass-loader'
            ],
            'sass': [
              'style-loader',
              'css-loader',
              'sass-loader?indentedSyntax'
            ]
          }
          // other vue-loader options go here
        }
      },
      {
        test: /\.js$/,
        loader: 'babel-loader',
        exclude: /node_modules/
      },
      {
        test: /\.(png|jpg|gif|svg)$/,
        loader: 'file-loader',
        options: {
          name: '[name].[ext]?[hash]',
          esModule: false
        }
      }
    ]
  },
  resolve: {
    alias: {
      'vue$': 'vue/dist/vue.runtime.esm-bundler.js',
    },
    extensions: ['*', '.js', '.vue', '.json']
  },
  devServer: {
    headers: {
      'Content-Security-Policy': "worker-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.usefathom.com;",
    },
    static: {
      directory: path.join(__dirname, 'public'),
    },
    client: {
      overlay: true,
    },
    historyApiFallback: {index: "/index.html"}
  },
  performance: {
    hints: false
  },
  plugins: [
    new VueLoaderPlugin(),
    new webpack.DefinePlugin({
      'process.env': {
        ONETECH_MOD_NAME: JSON.stringify(process.env.ONETECH_MOD_NAME),
        ONETECH_MOD_URL: JSON.stringify(process.env.ONETECH_MOD_URL),
      },
      ROOT_PATH: JSON.stringify(rootPath),
    })
  ],
  devtool: 'eval-source-map'
}

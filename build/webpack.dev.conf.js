let utils = require('./utils');
let webpack = require('webpack');
let config = require('../config');
let merge = require('webpack-merge');
let baseWebpackConfig = require('./webpack.base.conf');
let HtmlWebpackPlugin = require('html-webpack-plugin');
let FriendlyErrorsPlugin = require('friendly-errors-webpack-plugin');
let ChromeExtensionReloader = require('webpack-chrome-extension-reloader');

module.exports = merge(baseWebpackConfig, {
  module: {
    rules: utils.styleLoaders({
      sourceMap: config.dev.cssSourceMap,
    }),
  },
  plugins: [
    new webpack.DefinePlugin({
      'process.env': config.dev.env,
    }),
    new ChromeExtensionReloader({
      entries: {
        contentScript: 'content',
        background: 'background',
      },
    }),
    new webpack.NoEmitOnErrorsPlugin(),
    // https://github.com/ampedandwired/html-webpack-plugin
    new HtmlWebpackPlugin({
      filename: 'index.html',
      template: 'index.html',
      chunks: ['app'],
      inject: true,
    }),
    new HtmlWebpackPlugin({
      filename: 'background.html',
      chunks: ['background'],
      inject: true,
    }),
    new FriendlyErrorsPlugin(),
  ],
});

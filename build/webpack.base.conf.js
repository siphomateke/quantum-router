const utils = require('./utils');
const webpack = require('webpack');
const config = require('../config');
const vueLoaderConfig = require('./vue-loader.conf');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');

const isProduction = process.env.NODE_ENV === 'production';
const isBrowser = process.env.TARGET === 'browser';
const browserType = process.env.BROWSER;

const plugins = [
  // split vendor js into its own file
  new webpack.optimize.CommonsChunkPlugin({
    name: 'vendor',
    minChunks: function(module, count) {
      // any required modules inside node_modules are extracted to vendor
      return (
        module.resource &&
        /\.js$/.test(module.resource) &&
        module.resource.indexOf(
          utils.resolve('node_modules')
        ) === 0
      );
    },
  }),
  // extract webpack runtime and module manifest to its own file in order to
  // prevent vendor hash from being updated whenever app bundle is updated
  new webpack.optimize.CommonsChunkPlugin({
    name: 'manifest',
    chunks: ['vendor'],
  }),
  new CopyWebpackPlugin([{
    from: utils.resolve('static'),
    to: config.dev.assetsSubDirectory,
    ignore: ['.*', '*manifest.json'],
  }]),
  new webpack.ProvidePlugin({
    'browser': 'webextension-polyfill',
  }),
];

if (isBrowser) {
  let manifest = '';
  if (browserType == 'chrome') {
    manifest = 'chrome-manifest.json';
  } else {
    manifest = 'browser-manifest.json';
  }
  plugins.push(new CopyWebpackPlugin([{
    from: utils.resolve('static/'+manifest),
    to: config.dev.assetsSubDirectory+'manifest.json',
  }]));
}

const htmlWebpackPlugins = [
  {
    filename: 'index.html',
    template: 'src/index.html',
    chunks: ['manifest', 'vendor', 'app'],
  },
  {
    filename: 'background.html',
    template: 'src/background.html',
    chunks: ['manifest', 'vendor', 'background'],
  },
  {
    filename: 'options.html',
    template: 'src/options/options.html',
    chunks: ['manifest', 'vendor', 'options'],
  },
];

for (const plugin of htmlWebpackPlugins) {
  const pluginConfig = {
    filename: plugin.filename,
    template: utils.resolve(plugin.template),
    chunks: plugin.chunks,
    inject: true,
  };
  if (isProduction) {
    Object.assign(pluginConfig, {
      minify: {
        removeComments: true,
        collapseWhitespace: true,
        removeAttributeQuotes: true,
      },
      chunksSortMode: 'dependency',
    });
  }
  plugins.push(new HtmlWebpackPlugin(pluginConfig));
}

module.exports = {
  entry: {
    'app': utils.resolve('src/main.js'),
    'background': utils.resolve('src/chrome/background.js'),
    'options': utils.resolve('src/options/options.js'),
  },
  output: {
    path: config.build.assetsRoot,
    filename: '[name].js',
    publicPath: process.env.NODE_ENV === 'production' ?
      config.build.assetsPublicPath : config.dev.assetsPublicPath,
  },
  resolve: {
    extensions: ['.js', '.vue', '.json'],
    alias: {
      '@': utils.resolve('src'),
      'styles': utils.resolve('src/styles'),
      'vendor': utils.resolve('vendor'),
    },
  },
  module: {
    rules: [{
      test: /\.vue$/,
      loader: 'vue-loader',
      options: vueLoaderConfig,
    },
    {
      test: /\.js$/,
      loader: 'babel-loader',
      include: [utils.resolve('src'), utils.resolve('test')],
    },
    /* {
      test: /\.(js|vue)$/,
      loader: 'eslint-loader',
      enforce: 'pre',
      include: [utils.resolve('src'), utils.resolve('test')],
    },*/
    {
      test: /\.(png|jpe?g|gif|svg)(\?.*)?$/,
      loader: 'url-loader',
      options: {
        limit: 10000,
        name: utils.assetsPath('img/[name].[hash:7].[ext]'),
      },
    },
    {
      test: /\.(mp4|webm|ogg|mp3|wav|flac|aac)(\?.*)?$/,
      loader: 'url-loader',
      options: {
        limit: 10000,
        name: utils.assetsPath('media/[name].[hash:7].[ext]'),
      },
    },
    {
      test: /\.(woff2?|eot|ttf|otf)(\?.*)?$/,
      loader: 'url-loader',
      options: {
        limit: 10000,
        name: utils.assetsPath('fonts/[name].[hash:7].[ext]'),
      },
    },
    // Required until https://github.com/mozilla/webextension-polyfill/pull/86 is merged
    {
      test: require.resolve('webextension-polyfill'),
      use: 'imports-loader?browser=>undefined',
    },
    ],
  },
  plugins,
};

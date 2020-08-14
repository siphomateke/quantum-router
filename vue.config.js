const path = require('path');
const electronBuilderOptions = require('./electron-builder.json');

function resolvePath(pathToResolve) {
  return path.resolve(__dirname, pathToResolve);
}

module.exports = {
  lintOnSave: true,

  pages: {
    index: {
      entry: 'src/main.js',
      chunks: ['chunk-vendors', 'chunk-common', 'index', 'preload'],
    },
  },

  chainWebpack: (config) => {
    config.resolve.alias.set('styles', resolvePath('src/styles'));
    config.entry('preload').add(resolvePath('src/styles/preload.scss'));
    config.module
      .rule('eslint')
      .use('eslint-loader')
      .tap(options => Object.assign(options, { fix: true }));
  },

  configureWebpack: {
    node: {
      global: true,
    },
  },

  pluginOptions: {
    electronBuilder: {
      nodeIntegration: true,
      chainWebpackMainProcess: (config) => {
        config.resolve.alias.set('@', resolvePath('src'));
        return config;
      },
      // TODO: Fix icons not showing in Linux package installers
      builderOptions: electronBuilderOptions,
    },
  },

  css: {
    loaderOptions: {
      sass: {
        implementation: require('sass'),
      },
    },
  }
};

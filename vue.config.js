const path = require('path');
const electronBuilderOptions = require('./electron-builder.json');

function resolvePath(pathToResolve) {
  return path.resolve(__dirname, pathToResolve);
}

module.exports = {
  lintOnSave: false,

  pages: {
    index: {
      entry: 'src/main.js',
      chunks: ['chunk-vendors', 'chunk-common', 'index', 'preload'],
    },
  },

  chainWebpack: (config) => {
    config.resolve.alias.set('styles', resolvePath('src/styles'));
    config.entry('preload').add(resolvePath('src/styles/preload.scss'));
  },

  configureWebpack: {
    node: {
      global: true,
    },
  },

  pluginOptions: {
    electronBuilder: {
      chainWebpackMainProcess: (config) => {
        config.resolve.alias.set('@', resolvePath('src'));
        return config;
      },
      // TODO: Fix icons not showing in Linux package installers
      builderOptions: electronBuilderOptions,
    },
  },
};

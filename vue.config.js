const path = require('path');

function resolvePath(pathToResolve) {
  return path.resolve(__dirname, pathToResolve);
}

module.exports = {
  lintOnSave: false,

  pages: {
    'index': {
      entry: 'src/main.js',
      chunks: ['chunk-vendors', 'chunk-common', 'index', 'preload'],
    },
  },

  pluginOptions: {
    browserExtension: {
      components: {
        background: true,
        options: true,
        standalone: true,
      },
      api: 'browser',
      usePolyfill: true,
      autoImportPolyfill: true,
      componentOptions: {
        background: {
          entry: 'src/browser/background.js',
        },
      },
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
};

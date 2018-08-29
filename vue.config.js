module.exports = {
  lintOnSave: false,

  pages: {
    'app': {
      entry: 'src/main.js',
    },
    'options/options': {
      entry: 'src/options/options.js',
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
};

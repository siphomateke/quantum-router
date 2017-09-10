require('./check-versions')();

let config = require('../config');
if (!process.env.NODE_ENV) {
  process.env.NODE_ENV = JSON.parse(config.dev.env.NODE_ENV);
}

let webpack = require('webpack');
let webpackConfig = require('./webpack.dev.conf');

const compiler = webpack(webpackConfig);

const watching = compiler.watch({}, (err, stats) => {
  if (err) throw err;
  process.stdout.write(stats.toString({
    colors: true,
    modules: false,
    children: false,
    chunks: false,
    chunkModules: false,

    assets: false,
    hash: false,
    version: false,
    timings: false,
  }) + '\n\n');
});

module.exports = {
  close: () => {
    watching.close();
  },
};

require('./check-versions')();

var config = require('../config');
if (!process.env.NODE_ENV) {
  process.env.NODE_ENV = JSON.parse(config.dev.env.NODE_ENV);
}

var webpack = require('webpack');
var webpackConfig = require('./webpack.dev.conf');

const compiler = webpack(webpackConfig);

const watching = compiler.watch({}, (err, stats) => {
  if (err) throw err;
  process.stdout.write(stats.toString({
    colors: true,
    modules: false,
    children: false,
    chunks: false,
    chunkModules: false
  }) + '\n\n');
});

module.exports = {
  close: () => {
    watching.close(() => {
      console.log('Watching ended');
    });
  }
};

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
});

module.exports = {
  close: () => {
    watching.close();
  },
};

var gulp = require('gulp');
var notifier = require('node-notifier');
const { spawn } = require('child_process');

function webpackNotify(message) {
  notifier.notify({
    'title': 'Webpack',
    'message': message,
    'sound': false,
    'wait': true,
    'appID': 'Gulp'
  });
}

gulp.task('webpack', function(callback) {
  webpackNotify('Starting webpack.');
  var build = spawn('node', ['build/build.js']);

  build.stdout.on('data', (data) => {
    console.log(data.toString());
  });

  build.stderr.on('data', (data) => {
    console.log(`stderr: ${data}`);
  });

  build.on('close', (code) => {
    webpackNotify('Compilation complete!')
    callback(null);
  });
});

gulp.task('watch', ['webpack'], function() {
	gulp.watch(['src/**/*.js', 'src/**/*.vue'], ['webpack']);
});

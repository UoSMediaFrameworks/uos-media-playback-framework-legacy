'use strict';

var gulp = require('gulp');
var concat = require('gulp-concat'),
    livereload = require('gulp-livereload'),
    dest = 'dist';

var browserify = require('gulp-browserify');
var gutil = require('gulp-util');

gulp.task('browserify', function() {
    gulp.src('src/js/main.jsx')
    .pipe(browserify({transform: 'reactify', debug: true}))
    .on('error', gutil.log)
    .pipe(concat('main.js'))
    .pipe(gulp.dest('dist/js'));
});


gulp.task('html', function() {
    gulp.src('src/index.html')
    .pipe(gulp.dest('dist'));
});

gulp.task('css', function() {
    gulp.src('src/css/**/*.css')
        .pipe(concat('app.css'))
        .pipe(gulp.dest(dest + '/css'));
});

gulp.task('build', ['browserify', 'html', 'css']);

gulp.task('watch', ['build'], function () {
    gulp.watch('src/**/*.*', ['build']);

    livereload.listen();
    gulp.watch(dest + '/**').on('change', livereload.changed);
});

gulp.task('server', function(next) {
    var connect = require('connect'),
        serverStatic = require('serve-static'),
        connectLivereload = require('connect-livereload'),
        server = connect();
    server.use(connectLivereload({port: 35729}));
    server.use(serverStatic(dest, {'index': ['index.html']}));

    server.listen(process.env.PORT || 5000, next);
});

gulp.task('deploy', ['build'], function() {
    var deployCdn = require('deploy-azure-cdn');
    gulp.src(['dist/**/*'])
        .pipe(deployCdn.gulpPlugin({
            containerName: 'site',
            serviceOptions: ['mediaplayercontroller', '6mzoatD04udXOQE1EpxIHhCDQLui3G6kKWtE4kJqWGO7n6mdKYXB14P/8okDfKTF/wyVmgOIlzgt/4yOotTl0g==']      
        }));
        
});

gulp.task('default', ['server', 'watch']);
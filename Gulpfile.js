'use strict';

var gulp = require('gulp');
var concat = require('gulp-concat'),
    livereload = require('gulp-livereload'),
    dest = 'dist',
    lvPort = 35729;

var browserify = require('gulp-browserify');
var gutil = require('gulp-util');
var static_server = require('./static_server');


function browserifyHelper (startPath, finishName) {
    gulp.src(startPath)
    .pipe(browserify({transform: 'reactify', debug: true}))
    .on('error', gutil.log)
    .pipe(concat(finishName))
    .pipe(gulp.dest('dist/js'));
}

gulp.task('browserify', function() {
    browserifyHelper('src/js/index.jsx', 'index.js');
    browserifyHelper('src/js/viewer.jsx', 'viewer.js');
});


gulp.task('html', function() {
    gulp.src('src/*.html')
    .pipe(gulp.dest('dist'));
});

gulp.task('css', function() {
    gulp.src('src/css/**/*.css')
        .pipe(gulp.dest(dest + '/css'));
});

gulp.task('build', ['browserify', 'html', 'css']);

gulp.task('watch', function () {
    gulp.watch('src/**/*.*', ['build']);

    livereload.listen(lvPort);
    gulp.watch(dest + '/**').on('change', livereload.changed);
});

gulp.task('serve', ['build'], function(next) {
    static_server(dest, {callback: next, livereload: true});
});

gulp.task('deploy', ['build'], function() {
    var deployCdn = require('deploy-azure-cdn');
    gulp.src(['dist/**/*'])
        .pipe(deployCdn.gulpPlugin({
            containerName: 'site',
            serviceOptions: ['mediaplayercontroller', '6mzoatD04udXOQE1EpxIHhCDQLui3G6kKWtE4kJqWGO7n6mdKYXB14P/8okDfKTF/wyVmgOIlzgt/4yOotTl0g==']      
        }));
        
});

gulp.task('default', ['serve', 'watch']);
'use strict';

var gulp = require('gulp');
var gutil = require('gulp-util');
var source = require('vinyl-source-stream');
var watchify = require('watchify');
var mergeStream = require('merge-stream');
var objectAssign = require('object-assign');
var browserify = require('browserify');
var reactify = require('reactify');
var concat = require('gulp-concat'),
    livereload = require('gulp-livereload'),
    dest = 'dist',
    lvPort = 35729;

var static_server = require('./static_server');


/*
I don't want to have to define the browserify code twice.  Yet, I need it to run inside
of watchify, and then I also want to run it manually for the 'build' task.  So I have to 
abstract out the process of making a bundler, and then leave it open to manual triggering
*/

var indexBundler = bundlerBuilder('./src/js/index.jsx', 'index.js');
var viewerBundler = bundlerBuilder('./src/js/viewer.jsx', 'viewer.js');

function bundlerBuilder (startPath, finishName) {
    var bundler = watchify(browserify(startPath, objectAssign({debug: true}, watchify.args)));
    bundler.transform(reactify);
    var rebundle = function() {
        return bundler.bundle()
            .on('error', gutil.log.bind(gutil, 'Browserify Error'))
            .pipe(source(finishName))
            .pipe(gulp.dest('dist/js'));
    };

    return {bundler: bundler, rebundle: rebundle};
}

gulp.task('watch', function () { 
    // trigger livereload on any change to dest
    livereload.listen(lvPort);
    gulp.watch(dest + '/**').on('change', livereload.changed);

    // html changes
    gulp.watch('src/*.html', ['html']);

    // css changes
    gulp.watch('src/css/**/*.css', ['css']);

    indexBundler.bundler.on('update', indexBundler.rebundle);
    viewerBundler.bundler.on('update', viewerBundler.rebundle);
});

gulp.task('html', function() {
    return gulp.src('src/*.html')
        .pipe(gulp.dest('dist'));
});

gulp.task('css', function() {
    return gulp.src('src/css/**/*.css')
        .pipe(gulp.dest(dest + '/css'));
});

gulp.task('bundlejs', function() {
    return mergeStream(
        indexBundler.rebundle(),
        viewerBundler.rebundle()
    );
});

gulp.task('build-dist', ['bundlejs', 'html', 'css']);


///// BEGIN CLI TASKS ////////////////////////////////

gulp.task('build', ['build-dist'], function() {
    // watchify watch handles must be closed, otherwise gulp task will hang,
    // thus the .on('end', ...)
    indexBundler.bundler.close();
    viewerBundler.bundler.close();
});

gulp.task('serve', function(next) {
    static_server(dest, {callback: next, livereload: true});
});

gulp.task('default', ['build-dist', 'serve', 'watch']);

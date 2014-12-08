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


gulp.task('html', function() {
    return gulp.src('src/*.html')
        .pipe(gulp.dest('dist'));
});

gulp.task('css', function() {
    return gulp.src('src/css/**/*.css')
        .pipe(gulp.dest(dest + '/css'));
});

gulp.task('bundlejs', function() {
    // watchify watch handles must be closed, otherwise gulp task will hang,
    // thus the .on('end', ...)
    return mergeStream(
            indexBundler.rebundle(),
            viewerBundler.rebundle())
        .on('end', function() {
            indexBundler.bundler.close();
            viewerBundler.bundler.close();
        });

});

gulp.task('build', ['bundlejs', 'html', 'css']);

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

gulp.task('serve', ['build'], function(next) {
    static_server(dest, {callback: next, livereload: true});
});

gulp.task('deploy', ['build'], function() {
    var deployCdn = require('deploy-azure-cdn');
    return gulp.src(['dist/**/*'])
        .pipe(deployCdn.gulpPlugin({
            containerName: 'site',
            serviceOptions: ['mediaplayercontroller', '6mzoatD04udXOQE1EpxIHhCDQLui3G6kKWtE4kJqWGO7n6mdKYXB14P/8okDfKTF/wyVmgOIlzgt/4yOotTl0g==']      
        }));
        
});

gulp.task('default', ['build', 'serve', 'watch']);
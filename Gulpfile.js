'use strict';

var gulp = require('gulp');
var gutil = require('gulp-util');
var path = require('path');
var run = require('gulp-run');
var gulpif = require('gulp-if');
var template = require('gulp-template');
var source = require('vinyl-source-stream');
var buffer = require('vinyl-buffer');
var watchify = require('watchify');
var sourcemaps = require('gulp-sourcemaps');
var mergeStream = require('merge-stream');
var objectAssign = require('object-assign');
var browserify = require('browserify');
var reactify = require('reactify');
var envify = require('envify');
var stripify = require('stripify');
//var streamify = require('gulp-streamify'); AJF: removed as can't find it being used
var uglify = require('gulp-uglify');
var concat = require('gulp-concat'),
    livereload = require('gulp-livereload'),
    dest = 'dist',
    lvPort = 35729;

var cssGlobs = ['src/css/**/*.css', 'node_modules/codemirror/lib/*.css'];

var static_server = require('./static_server');

/*
 only uglify in production.  Since chrome inspector doesn't support source map
 variable names, debugging sucks when minified
 https://code.google.com/p/chromium/issues/detail?id=327092
*/
var production = process.env.NODE_ENV === 'production';
if (production) {
    gutil.log('making production build');
}


var debugMode = process.env.DEBUG === 'true';

gutil.log('debugMode: ' + debugMode);


if(debugMode) {
    gutil.log('debug turned on');
}

/*
  I don't want to have to define the browserify code twice.  Yet, I need it to run inside
  of watchify, and then I also want to run it manually for the 'build' task.  So I have to
  abstract out the process of making a bundler, and then leave it open to manual triggering
*/
var indexBundler = bundlerBuilder('./src/js/index.jsx', 'index.js', true);
var viewerBundler = bundlerBuilder('./src/js/viewer.jsx', 'viewer.js', true);
var manifest2015Bundler = bundlerBuilder('./src/js/manifest2015.js', 'manifest2015.js', false);
var graphViewerBundler = bundlerBuilder('./src/js/graph-viewer.jsx', 'graph-viewer.js', true);
var adjustablGridBundler= bundlerBuilder('./src/js/single-page-grid-layout.jsx','single-page-grid-layout.js',true);
function bundlerBuilder (startPath, finishName, useReactify) {
    var bundler = watchify(browserify(startPath, objectAssign({debug: true, cache: {}, packageCache: {}}, watchify.args)));
    if (useReactify) {
        bundler.transform(reactify);
    }

    if(!debugMode) {
        bundler.transform("stripify")
    }

    bundler.transform(envify);
    bundler.on('log', gutil.log);

    var rebundle = function() {
        return bundler.bundle()
            .on('error', gutil.log.bind(gutil, 'Browserify Error'))
            .pipe(source(finishName))
            // .pipe(gulpif(production, buffer()))
            // .pipe(gulpif(production, sourcemaps.init({loadMaps: true})))
            // .pipe(gulpif(production, uglify()))
            // .pipe(gulpif(production, sourcemaps.write('./')))
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
    gulp.watch(cssGlobs, ['css']);

    indexBundler.bundler.on('update', indexBundler.rebundle);
    viewerBundler.bundler.on('update', viewerBundler.rebundle);
    manifest2015Bundler.bundler.on('update', manifest2015Bundler.rebundle);
    graphViewerBundler.bundler.on('update', graphViewerBundler.rebundle);
    adjustablGridBundler.bundler.on('update', adjustablGridBundler.rebundle);
});

gulp.task('html', function() {
    return gulp.src('src/*.html')
        .pipe(template({polyfillFeatures: 'Element.prototype.classList,Object.create'}))
        .pipe(gulp.dest('dist'));
});

gulp.task('css', function() {
    return gulp.src(cssGlobs)
        .pipe(gulp.dest(dest + '/css'));
});

gulp.task('bundlejs', function() {
    return mergeStream(
        indexBundler.rebundle(),
        viewerBundler.rebundle(),
        manifest2015Bundler.rebundle(),
        graphViewerBundler.rebundle(),
        adjustablGridBundler.rebundle()
    );
});

gulp.task('build-version-document', function() {
    return run('node ./build/app-versioning/app-version.js').exec();
});

gulp.task('include-monaco-editor', function() {
    //APEP - Small hack to include this full dependency within th dist folder - typically this should be hosted on a CDN. Or build into the bundle
    return gulp.src(['node_modules/react-monaco-editor/node_modules/monaco-editor/**']).pipe(gulp.dest('dist/monaco-editor'));
});

gulp.task('include-schemas', function() {
    return gulp.src(['src/schemas/**']).pipe(gulp.dest('dist/schemas'));
});

gulp.task('build-dist', ['bundlejs', 'html', 'css', 'include-monaco-editor', 'include-schemas', 'build-version-document']);


///// BEGIN CLI TASKS ////////////////////////////////

gulp.task('build', ['build-dist'], function() {
    // watchify watch handles must be closed, otherwise gulp task will hang,
    // thus the .on('end', ...)
    indexBundler.bundler.close();
    viewerBundler.bundler.close();
    manifest2015Bundler.bundler.close();
    graphViewerBundler.bundler.close();
    adjustablGridBundler.bundler.close();
});

gulp.task('serve', function(next) {
    static_server(dest, {callback: next, livereload: true});
});

//, 'watch'
gulp.task('default', ['build-dist', 'serve','watch']);

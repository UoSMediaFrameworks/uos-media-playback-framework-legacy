'use strict';

var gulp = require('gulp');
var gutil = require('gulp-util');
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
var uglify = require('gulp-uglify');
var gulpBabel = require('gulp-babel');
var concat = require('gulp-concat'),
    livereload = require('gulp-livereload'),
    dest = 'dist',
    src = 'src',
    lvPort = 35729;
var realFs = require('fs');
var gracefulFs = require('graceful-fs');

var cssGlobs = ['src/css/**/*.css'];
gracefulFs.gracefulify(realFs);
var static_server = require('./static_server');

// APEP tools for creating and writing the version json file
var gitVersion = require('./build/app-versioning/app-version');
var jsonfile = require('jsonfile');

var rev = require("gulp-rev");
var revReplace = require("gulp-rev-replace");

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
            .pipe(gulpif(production, buffer()))
            .pipe(gulpif(production, sourcemaps.init({loadMaps: true})))
            .pipe(gulpif(production, gulpBabel({presets:['@babel/env'], ignore:["node_modules"]})))
            .pipe(gulpif(production, uglify()))
            .pipe(gulpif(production, sourcemaps.write('./')))
            .pipe(gulp.dest(dest + '/js'));
    };

    return {bundler: bundler, rebundle: rebundle};
}

gulp.task('watch', function () {
    // trigger livereload on any change to dest
    livereload.listen(lvPort);

    // application source code changes
    gulp.watch('src/**').on('change', livereload.changed);

    // service worker changes
    gulp.watch('src/sw-toolbox.js', ['service-workers']);

    // html changes
    gulp.watch('src/*.html', ['html']);

    gulp.watch('src/images/**', ['images']);

    // css changes
    gulp.watch(cssGlobs, ['css']);

    indexBundler.bundler.on('update', indexBundler.rebundle);
});

gulp.task('html', function() {
    return gulp.src('src/*.html')
        .pipe(template({polyfillFeatures: 'Element.prototype.classList,Object.create'}))
        .pipe(gulp.dest(dest));
});

gulp.task('icon',function(){
    return gulp.src('src/*.ico')
        .pipe(gulp.dest(dest));
});
gulp.task('images',function(){
   return gulp.src('src/images/*')
       .pipe(gulp.dest(dest+ '/images'));
});

gulp.task('css', function() {
    return gulp.src(cssGlobs)
        .pipe(gulp.dest(dest + '/css'));
});

gulp.task('bundlejs', function() {
    return mergeStream(
        indexBundler.rebundle()
    );
});

gulp.task('build-version-document', function(cb) {
    gitVersion.buildUsingGithubPublicAPI(function(versionJsonDoc) {
        if(versionJsonDoc) {
            jsonfile.writeFile(gitVersion.VERSION_LOCAL_FILE, versionJsonDoc, cb);
        } else {
            cb();
        }
    })
});

gulp.task('include-monaco-editor', function() {
    //APEP - Small hack to include this full dependency within th dist folder - typically this should be hosted on a CDN. Or build into the bundle
    return gulp.src(['node_modules/monaco-editor/**']).pipe(gulp.dest('dist/monaco-editor'));
});

gulp.task('external-deps-for-china', function() {
    return gulp.src(['external-client-side-deps/**']).pipe(gulp.dest('dist/external'));
});

gulp.task('include-schemas',function(){
    return gulp.src(['src/schemas/**']).pipe(gulp.dest('dist/schemas'));
});

gulp.task('service-workers',function(){
    return gulp.src(['src/sw-toolbox.js']).pipe(gulp.dest('dist'));
});

gulp.task('build-dist', ['service-workers', 'bundlejs', 'html', 'css', 'icon', 'images', 'external-deps-for-china',  'include-monaco-editor', 'include-schemas', 'build-version-document']);

///// BEGIN CLI TASKS ////////////////////////////////

gulp.task('build', ['build-dist'], function() {
    // watchify watch handles must be closed, otherwise gulp task will hang,
    // thus the .on('end', ...)
    indexBundler.bundler.close();
});

gulp.task("revision-js", ["build"], function () {
    return gulp.src(["dist/js/*.js"])
        .pipe(rev())
        .pipe(gulp.dest(dest + '/js')) // pipe the revision dist js into the js folder
        .pipe(rev.manifest())
        .pipe(gulp.dest(dest)) // pipe the revision map into root directory for html filename replace
});

gulp.task("revreplace", ["revision-js"], function(){
    var manifest = gulp.src("./" + dest + "/rev-manifest.json");

    return gulp.src(src + "/index.html")
        .pipe(revReplace({manifest: manifest}))
        .pipe(gulp.dest(dest));
});

gulp.task('build-revision', ['revreplace'], function () {

});

gulp.task('serve', function(next) {
    static_server(dest, {callback: next, livereload: true});
});

//, 'watch'
gulp.task('default', ['build-dist', 'serve', 'watch']);

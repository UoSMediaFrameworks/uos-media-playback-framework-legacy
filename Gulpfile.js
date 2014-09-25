'use strict';

var gulp = require('gulp'),
    jshint = require('gulp-jshint'),
    browserify = require('gulp-browserify'),
    concat = require('gulp-concat'),
    refresh = require('gulp-livereload'),
    lrserver = require('tiny-lr')(),
    express = require('express'),
    livereload = require('connect-livereload'),
    gulpBowerFiles = require('gulp-bower-files'),
    gulpFilter = require('gulp-filter'),
    flatten = require('gulp-flatten'),
    rimraf = require('rimraf'),
    angularInjector = require('gulp-angular-injector'),
    livereloadport = 35729,
    serverport = 5000;

// Set up an express server (but not starting it yet)
var server = express();
// Add live reload
server.use(livereload({port: livereloadport}));
// Use our 'dist' folder as rootfolder
server.use(express.static('./dist'));

gulp.task('dev', ['clean-dist'], function() {
    gulp.start('copy-css', 'html', 'jshint', 'browserify', 'bower-files');
    // Start webserver
    server.listen(serverport);
    // Start live reload
    lrserver.listen(livereloadport);
});

gulp.task('clean-dist', function(cb) {
    rimraf('dist/*', cb);
});

gulp.task('jshint', function() {
    gulp.src('./app/scripts/*.js')
    .pipe(jshint())
    // You can look into pretty reporters as well, but that's another story
    .pipe(jshint.reporter('default'));
});

gulp.task('browserify', function() {
    // Single point of entry (make sure not to src ALL your files, browserify will figure it out for you)
    gulp.src(['app/scripts/main.js'])
    .pipe(browserify({
        insertGlobals: true,
        debug: true
    }))
    // Bundle to a single file
    .pipe(concat('bundle.js'))
    .pipe(angularInjector())
    // Output it to our dist folder
    .pipe(gulp.dest('dist/js'))
    .pipe(refresh(lrserver));
});

gulp.watch(['app/scripts/*.js', 'app/scripts/**/*.js'],[
    'jshint',
    'browserify'
]);

gulp.task('html', function() {
    gulp.src('./app/**/*.html')
    .pipe(gulp.dest('dist/'))
    .pipe(refresh(lrserver)); // Tell the lrserver to refresh
});

gulp.watch(['app/**/*.html'], [
    'html'
]);

gulp.task('copy-css', function() {
    gulp.src('./app/css/**/*')
    .pipe(gulp.dest('dist/css/'))
    .pipe(refresh(lrserver));
});

gulp.watch(['app/css/**/*'], ['copy-css']);

gulp.task('bower-files', function() {
    // css
    gulpBowerFiles({debugging: true})
    .pipe(gulpFilter('**/*.css'))
    .pipe(concat('vendor.css'))
    .pipe(gulp.dest('dist/css/'));

    // fonts
    gulpBowerFiles({debugging: true})
    .pipe(gulpFilter('**/*.{eot,svg,ttf,woff}'))
    .pipe(flatten())
    .pipe(gulp.dest('dist/fonts/'));
});

gulp.watch(['bower_components/**/*'], ['bower-files']);
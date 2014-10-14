var gulp = require('gulp');
var concat = require('gulp-concat');
var sourcemaps = require('gulp-sourcemaps');
var uglify = require('gulp-uglify');
var ngAnnotate = require('gulp-ng-annotate'),
    livereload = require('gulp-livereload'),
    dest = 'dist',
    app = 'app';

gulp.task('js', function () {
    gulp.src([app + '/scripts/**/main.js', app + '/scripts/**/*.js'])
        .pipe(sourcemaps.init())
        .pipe(concat('app.js'))
        .pipe(ngAnnotate())
    //.pipe(uglify())
        .pipe(sourcemaps.write({sourceRoot: '/app/scripts'}))
        .pipe(gulp.dest(dest + '/scripts'));
});

gulp.task('css', function() {
    gulp.src(app + '/css/**/*.css')
        .pipe(concat('app.css'))
        .pipe(gulp.dest(dest + '/css'));
});

gulp.task('html', function() {
    gulp.src(app + '/**/*.html')
        .pipe(gulp.dest(dest+'/'));
});

gulp.task('vendor', function() {
    var mainBowerFiles = require('main-bower-files'),
        filter = require('gulp-filter'),
        flatten = require('gulp-flatten'),
        jsFilter = filter('*.js'),
        cssFilter = filter('*.css'),
        cssMapsFilter = filter('*.css.map'),
        fontFilter = filter(['*.eot', '*.woff', '*.svg', '*.ttf']);

    return gulp.src(mainBowerFiles({debugging: true}))
        .pipe(jsFilter)
        .pipe(concat('vendor.js'))
    //.pipe(uglify())
        .pipe(gulp.dest(dest + '/scripts'))
        .pipe(jsFilter.restore())
    
        .pipe(cssFilter)
        .pipe(concat('vendor.css'))
        .pipe(gulp.dest(dest + '/css'))
        .pipe(cssFilter.restore())

        .pipe(cssMapsFilter)
        .pipe(flatten())
        .pipe(gulp.dest(dest + '/css'))
        .pipe(cssMapsFilter.restore())

        .pipe(fontFilter)
        .pipe(flatten())
        .pipe(gulp.dest(dest + '/fonts'));
});

gulp.task('watch', ['js', 'css', 'html', 'vendor'], function () {
    gulp.watch(app + '/scripts/**/*.js', ['js']);
    gulp.watch(app + '/css/**/*.css', ['css']);
    gulp.watch(app + '/**/*.html', ['html']);
    gulp.watch('bower_components/**/*', ['vendor']);
    
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

gulp.task('deploy', function() {
    var deployCdn = require('deploy-azure-cdn');
    gulp.src(['dist/**/*'])
        .pipe(deployCdn.gulpPlugin({
            containerName: 'site',
            serviceOptions: ['mediaplayercontroller', '6mzoatD04udXOQE1EpxIHhCDQLui3G6kKWtE4kJqWGO7n6mdKYXB14P/8okDfKTF/wyVmgOIlzgt/4yOotTl0g==']      
        }));
        
});

gulp.task('default', ['server', 'watch']);



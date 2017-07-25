'use strict';

// Modules dependencies
const path = require('path');
const glob = require('glob');
const gulp = require('gulp');
const browserSync = require('browser-sync').create();
const less = require('gulp-less');
const nodemon = require('gulp-nodemon');
const autoprefixer = require('gulp-autoprefixer');
const sourcemaps = require('gulp-sourcemaps');
const requirejs = require('gulp-requirejs-optimize');
const header = require('gulp-header');
const cleanCSS = require('gulp-clean-css');
const stripDebug = require('gulp-strip-debug');
const rev = require('gulp-rev');
const override = require('gulp-rev-css-url');
const revCollector = require('gulp-rev-collector');
const replace = require('gulp-string-replace');
const htmlmin = require('gulp-htmlmin');
const runSequence = require('run-sequence');
const del = require('del');
const vinylPaths = require('vinyl-paths');
const mainBowerFiles = require('main-bower-files');
const devip = require('dev-ip');
const config = require('./config.json');

// Work Path
const PATH = {
  SRC: './app',
  LESS: 'less/app.less',
  CSS: 'app/css',
  VENDOR: 'bower_components',
  LIB: 'app/lib',
  BUILD: 'app/build',
  DIST: 'www'
}

// Metadata for build files
const now = new Date();
const TIMESTAMP = {
  YEAR: now.getFullYear(),
  MONTH: now.getMonth() + 1,
  DAY: now.getDate()
};

const banner = `
/**
 * <%= pkg.name %> <%= pkg.version %>
 *
 * Copyright (c) ${TIMESTAMP.YEAR}, xxx.com.
 * All rights reserved.
 *
 * LICENSE
 * build: ${TIMESTAMP.YEAR}-${TIMESTAMP.MONTH}-${TIMESTAMP.DAY}
 */
`;

// Tasks
gulp.task('bower', () => {
  gulp.src(mainBowerFiles(), {
    base: PATH.VENDOR
  })
    .pipe(gulp.dest(PATH.LIB));
});

gulp.task('browser-sync', ['nodemon'], () => {
  browserSync.init(null, {
    proxy: `${devip()}:${config.port}`,
    open: false,
    port: 5000
  });
});

gulp.task('nodemon', (cb) => {
  let started = false;

  return nodemon({
    script: 'server.js',
    watch: ['server.js', 'views/**/*.ejs', 'routes/*.js'],
    ignore: ['less/', 'app/', 'gulpfile.js']
  }).on('start', () => {
    if (!started) {
      cb();
      started = true;
    }
  }).on('restart', () => {
    setTimeout(() => {
      browserSync.reload({
        stream: false
      });
    }, 1000);
  });
});

gulp.task('less', () => {
  gulp.src(PATH.LESS)
    .pipe(sourcemaps.init())
    .pipe(less())
    .pipe(autoprefixer({
      browsers: ['last 2 versions']
    }))
    .pipe(sourcemaps.write('./'))
    .pipe(gulp.dest(PATH.CSS))
    .pipe(browserSync.stream({
      match: '**/*.css'
    }));
});

gulp.task('cssmin', ['less'], () => {
  return gulp.src('app/css/app.css')
    .pipe(cleanCSS())
    .pipe(header(banner, {
      'pkg': require('./package.json')
    }))
    .pipe(gulp.dest(PATH.BUILD));
});

gulp.task('jsmin', () => {
  let controllers = [];
  const files = glob.sync('app/js/controllers/**/*js');
  files.forEach(file => {
    file = file.replace(/app.js\//, '').replace(/\.js$/, '');
    controllers.push(file);
  });
  console.log(controllers);
  return gulp.src('app/js/main.js')
    .pipe(sourcemaps.init())
    .pipe(requirejs({
      baseUrl: 'app/js',
      mainConfigFile: 'app/js/main.js',
      name: 'main',
      include: controllers
    }))
    .pipe(stripDebug())
    .pipe(header(banner, {
      'pkg': require('./package.json')
    }))
    .pipe(sourcemaps.write('./'))
    .pipe(gulp.dest(PATH.BUILD));
});

gulp.task('copy', () => {
  return gulp.src([
    'app/fonts/*',
    'app/lib/**/*',
    'app/favicon.ico'
  ], { base: 'app' })
    .pipe(gulp.dest(PATH.DIST));
});

gulp.task('default', ['browser-sync', 'less'], () => {
  gulp.watch('less/**/*.less', ['less']);
  gulp.watch([
    'app/*.html',
    'app/js/**/*.js',
    'app/lib/**/*.*',
    'app/img/**/*.{png|gif|jpg|jpeg}',
    'app/fonts/iconfont.{svg|ttf}',
    'views/**/*.ejs'
  ], browserSync.reload);
});

gulp.task('build', ['cssmin', 'jsmin']);

gulp.task('revAssets', () => {
  return gulp.src(['app/build/*', 'app/img/**/*'], {
    base: 'app'
  })
    .pipe(rev())
    .pipe(override())
    .pipe(gulp.dest(PATH.DIST))
    .pipe(rev.manifest())
    .pipe(gulp.dest(PATH.DIST))
});

gulp.task('revHtml', () => {
  return gulp.src(['www/rev-manifest.json', 'app/**/*.html'])
    .pipe(revCollector())
    .pipe(htmlmin({ collapseWhitespace: true }))
    .pipe(gulp.dest(PATH.DIST))
});

gulp.task('replaceMap', () => {
  gulp.src(['www/build/*.js'])
    .pipe(replace('main.js.map', path.basename(require('./www/rev-manifest.json')['build/main.js.map'])))
    .pipe(vinylPaths(del))
    .pipe(gulp.dest(path.resolve(PATH.DIST, 'build')));
});

gulp.task('clean', () => {
  return del(PATH.DIST);
});

gulp.task('dist', (done) => {
  runSequence(
    ['clean', 'build'],
    ['copy', 'revAssets'],
    ['replaceMap', 'revHtml'],
    done
  );
});

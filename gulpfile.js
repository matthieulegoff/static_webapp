
var gulp         = require('gulp'),
    rename       = require('gulp-rename'),
    sass         = require('gulp-sass'),
    cleanCSS     = require('gulp-clean-css'),
    concat       = require('gulp-concat'),
    uglify       = require('gulp-uglify'),
    autoprefixer = require('gulp-autoprefixer'),
    browserSync  = require('browser-sync'),
    reload       = browserSync.reload,
    htmlmin      = require('gulp-htmlmin'),
    size         = require('gulp-size'),
    imagemin     = require('gulp-imagemin'),
    del          = require('del'),
    sourcemaps   = require('gulp-sourcemaps'),

    // Temporary solution until gulp 4
    // https://github.com/gulpjs/gulp/issues/355
    runSequence = require('run-sequence');

var paths = {
  styles: {
    src:  {
      base: 'src/styles/base.scss',
      others: 'src/styles/**/*.scss'
    },
    dest: 'public/css/'
  },
  scripts: {
    src:  'src/scripts/**/*.js',
    dest: 'public/js/'
  },
  images: {
    src: 'src/images/**/*.{jpg,jpeg,png}',
    dest: 'public/img/'
  },
  files: {
    src: {
      html: 'src/*.html',
      others: 'src/*.{txt,xml,ico,png}'
    },
    dest: 'public/'
  }
};

gulp.task('clean', function() {
  return del([paths.files.dest]);
});

gulp.task('serve', function() {
  browserSync.init({
    server: paths.files.dest
  });
});

gulp.task('styles', function() {
  return gulp.src(paths.styles.src.base)
    .pipe(sourcemaps.init())
    .pipe(sass().on('error', sass.logError))
    .pipe(autoprefixer({
      browsers: ['last 2 versions'],
      cascade: false
    }))
    .pipe(cleanCSS())
    .pipe(size({ gzip: true, showFiles: true }))
    .pipe(rename({
      basename: 'styles',
      suffix: '.min'
    }))
    .pipe(gulp.dest(paths.styles.dest))
    .pipe(reload({stream:true}));
});

gulp.task('scripts', function() {
  return gulp.src(paths.scripts.src, { sourcemaps: true })
    .pipe(uglify().on('error', function(e) { console.log(e); }))
    .pipe(size({ gzip: true, showFiles: true }))
    .pipe(concat('scripts.min.js'))
    .pipe(gulp.dest(paths.scripts.dest))
    .pipe(reload({stream:true}));
});

gulp.task('copy', function() {
  return gulp.src(paths.files.src.others)
    .pipe(gulp.dest(paths.files.dest))
    .pipe(reload({stream:true}));
});

gulp.task('html', function() {
  gulp.src(paths.files.src.html)
    .pipe(htmlmin({collapseWhitespace: true}))
    .pipe(gulp.dest(paths.files.dest))
    .pipe(reload({stream:true}));
});

gulp.task('watch', function() {
  gulp.watch(paths.styles.src.others, ['styles']);
  gulp.watch(paths.scripts.src, ['styles']);
  gulp.watch(paths.images.src, ['images']);
  gulp.watch(paths.files.src.html, ['html']);
});

gulp.task('images', function() {
  return gulp.src(paths.images.src)
    .pipe(imagemin({optimizationLevel: 5}))
    .pipe(gulp.dest(paths.images.dest))
    .pipe(reload({stream:true}));
});

gulp.task('build', function(done) {
  runSequence('clean', 'styles', 'scripts', 'html', 'images', 'copy', done);
});

gulp.task('default', function(done) {
  runSequence('build', 'serve', 'watch', done);
});

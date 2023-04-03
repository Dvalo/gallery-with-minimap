const gulp = require('gulp');
const sass = require('gulp-sass')(require('sass'));
const sourcemaps = require('gulp-sourcemaps');
const plumber = require('gulp-plumber');
const babel = require('gulp-babel');
const webpack = require('webpack-stream');
const concat = require('gulp-concat');
const uglify = require('gulp-uglify');
const cleanCSS = require('gulp-clean-css');
const autoprefixer = require('gulp-autoprefixer');
const dependents = require('gulp-dependents');
const imagemin = require('gulp-imagemin');
const imageResponsive = require('gulp-sharp-responsive');
const del = require('del');
const browserSync = require('browser-sync').create();

const paths = {
  styles: {
    src: 'src/scss/**/*.scss',
    dest: 'dist/css',
  },
  scripts: {
    src: 'src/js/**/*.js',
    dest: 'dist/js',
  },
  html: {
    src: 'src/*.html',
    dest: 'dist',
  },
  image: {
    src: 'src/assets/images/**/*',
    dest: 'dist/assets',
  },
};

const clean = () => {
  return del(['dist']);
};

const css = () => {
  return gulp
    .src(paths.styles.src)
    .pipe(plumber())
    .pipe(dependents())
    .pipe(sourcemaps.init())
    .pipe(sass().on('error', sass.logError))
    .pipe(cleanCSS())
    .pipe(
      autoprefixer({
        cascade: false,
      })
    )
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest(paths.styles.dest))
    .pipe(browserSync.stream());
};

const js = () => {
  return gulp
    .src(paths.scripts.src)
    .pipe(plumber())
    .pipe(
      webpack({
        mode: 'production',
      })
    )
    .pipe(sourcemaps.init())
    .pipe(
      babel({
        presets: ['@babel/env'],
      })
    )
    .pipe(concat('scripts.js'))
    .pipe(uglify())
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest(paths.scripts.dest))
    .pipe(browserSync.stream());
};

const html = () => {
  return gulp
    .src(paths.html.src)
    .pipe(gulp.dest(paths.html.dest))
    .pipe(browserSync.stream());
};

const images = () => {
  return (
    gulp
      .src(paths.image.src)
      .pipe(imagemin())
      .pipe(
        imageResponsive({
          formats: [
            { width: 480, format: 'webp', rename: { suffix: '-sm' } },
            { width: 768, format: 'webp', rename: { suffix: '-md' } },
            { width: 1024, format: 'webp', rename: { suffix: '-lg' } },
            { width: 1920, format: 'webp', rename: { suffix: '-xl' } },
            { format: 'jpeg' },
          ],
        })
      )
      .pipe(gulp.dest(paths.image.dest))
  );
};

const watch = () => {
  browserSync.init({
    server: {
      baseDir: 'dist',
    },
    port: 3000,
    ghostMode: false,
  });
  gulp.watch(paths.styles.src, css);
  gulp.watch(paths.scripts.src, js);
  gulp.watch(paths.html.src, html);
  gulp.watch(paths.image.src, images);
};

const build = gulp.series(clean, gulp.parallel(css, js, html, images));

gulp.task('css', css);
gulp.task('js', js);
gulp.task('html', html);
gulp.task('images', images);
gulp.task('watch', watch);
gulp.task('build', build);

gulp.task('default', gulp.series(gulp.parallel(css, js, html, images), watch));

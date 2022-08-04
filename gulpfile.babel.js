import gulp from "gulp";

import htmlmin from "gulp-htmlmin";
import pug from "gulp-pug";

import postcss from "gulp-postcss";
import cssnano from "cssnano";
import autoprefixer from "autoprefixer";

import dartSass from "sass";
import gulpSass from "gulp-sass";
const sass = gulpSass(dartSass);

//Clean CSS
import clean from "gulp-purgecss";

//Caché bust
import cacheBust from "gulp-cache-bust";

import imagemin, { gifsicle, mozjpeg, optipng, svgo } from "gulp-imagemin";

import babel from "gulp-babel";
import terser from "gulp-terser";
import concat from "gulp-concat";

//Browser sync
import browserSync from "browser-sync";
const server = browserSync.create();

//Plumber
import plumber from "gulp-plumber";

//Variables/constantes

const production = false;
const paths = {
  root: {
    www: "docs",
  },
  src: {
    root: "src",
    pug: "src/pug/index.pug",
    html: "src/html/**/*.html",
    css: "src/css/*.css",
    scss: "src/scss/**/*.scss",
    js: "src/js/**/*.js",
    vendors: "src/assets/vendors/**/*.*",
    imgs: "src/assets/img/**/*.+(png|jpg|gif|svg)",
  },
  dist: {
    root: "docs",
    php: "docs/php",
    pug: "docs",
    html: "docs",
    css: "docs/css",
    js: "docs/js",
    imgs: "docs/assets/img",
    vendors: "docs/assets/vendors",
  },
};

// htmlTask
gulp.task("htmlTask", () => {
  return gulp
    .src(paths.src.html)
    .pipe(plumber())
    .pipe(htmlmin({ collapseWhitespace: true, removeComments: true }))
    .pipe(cacheBust({ type: "timestamp" }))
    .pipe(gulp.dest(paths.dist.html));
});

// pugTask
gulp.task("pugTask", () => {
  return gulp
    .src(paths.src.pug)
    .pipe(plumber())
    .pipe(pug({ pretty: production ? false : true }))
    .pipe(cacheBust({ type: "timestamp" }))
    .pipe(gulp.dest(paths.dist.pug));
});

// Minify + Combine CSS
gulp.task("cssTask", () => {
  return gulp
    .src(paths.src.css)
    .pipe(plumber())
    .pipe(concat("styles-min.css"))
    .pipe(postcss([cssnano(), autoprefixer()]))
    .pipe(gulp.dest(paths.dist.css));
});

// clean CSS
gulp.task("cleanTask", () => {
  return gulp
    .src(paths.dist.css + "/styles-min.css")
    .pipe(plumber())
    .pipe(clean({ content: [paths.dist.html + "/index.html"] }))
    .pipe(gulp.dest(paths.dist.css));
});

// Compile SCSS
gulp.task("sassTask", () => {
  return gulp
    .src(paths.src.scss)
    .pipe(plumber())
    .pipe(sass({ outputStyle: "expanded" }).on("error", sass.logError))
    .pipe(postcss([cssnano(), autoprefixer()]))
    .pipe(gulp.dest(paths.src.root + "/css"))
    .pipe(browserSync.stream());
});

// imgTask
gulp.task("imgTask", () => {
  return gulp
    .src(paths.src.imgs)
    .pipe(plumber())
    .pipe(imagemin())
    .pipe(gulp.dest(paths.dist.imgs));
});

// Minify + Combine JS
gulp.task("jsTask", () => {
  return gulp
    .src(paths.src.js)
    .pipe(plumber())
    .pipe(babel())
    .pipe(concat("script-min.js"))
    .pipe(terser())
    .pipe(gulp.dest(paths.dist.js))
    .pipe(browserSync.stream());
});

gulp.task("default", () => {
  browserSync.init({
    server: {
      baseDir: paths.root.www,
      // baseDir: 'docs',
      // proxy: "localhost/portfolio/docs",
    },
  });

  gulp.watch(paths.src.html, gulp.series("htmlTask"));
  gulp.watch(paths.src.pug, gulp.series("pugTask"));
  gulp.watch(paths.src.imgs, gulp.series("imgTask"));
  gulp.watch(paths.src.scss, gulp.series("sassTask", "cssTask"));
  // gulp.watch(paths.src.css, gulp.series("cssTask"));
  gulp.watch(paths.src.js, gulp.series("jsTask"));
  gulp.watch(paths.dist.html).on("change", browserSync.reload);
});

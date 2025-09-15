import gulp from 'gulp';
import less from 'gulp-less';
import pug from 'gulp-pug';
import babel from 'gulp-babel';
import uglify from 'gulp-uglify';
import cleanCSS from 'gulp-clean-css';
import concat from 'gulp-concat';
import sourcemaps from 'gulp-sourcemaps';
import browserSync from 'browser-sync';

const paths = {
    pug: {
        src: 'public/views/*.pug',
        dest: 'dist/',
    },
    styles: {
        src: 'public/style/**/*.less',
        dest: 'dist/css',
    },
    scripts: {
        src: 'public/js/**/*.js',
        dest: 'dist/js/',
    },
    images: {
        src: 'public/uploads/**/*.{jpg,jpeg,png,webp,gif}',
        dest: 'dist/uploads/',
    },
    assets: {
        src: 'public/images/**/*',
        dest: 'dist/images/',
    },
};

function compilePug() {
    return gulp.src(paths.pug.src)
        .pipe(pug({ pretty: true }))
        .pipe(gulp.dest(paths.pug.dest))
        .pipe(browserSync.stream());
}

function compileLess() {
    return gulp.src(paths.styles.src)
        .pipe(sourcemaps.init())
        .pipe(less())
        .pipe(cleanCSS())
        .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest(paths.styles.dest))
        .pipe(browserSync.stream());
}

function scripts() {
    return gulp.src(paths.scripts.src)
        .pipe(sourcemaps.init())
        .pipe(babel({
            presets: ['@babel/preset-env']
        }))
        .pipe(uglify())
        .pipe(concat('main.min.js'))
        .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest(paths.scripts.dest))
        .pipe(browserSync.stream());
}

function images() {
    return gulp.src(paths.images.src)
        .pipe(gulp.dest(paths.images.dest))
        .pipe(browserSync.stream());
}

function assets() {
    return gulp.src(paths.assets.src)
        .pipe(gulp.dest(paths.assets.dest));
}

function watchFiles() {
    gulp.watch(paths.styles.src, compileLess);
    gulp.watch(paths.scripts.src, scripts);
    gulp.watch(paths.images.src, images);
    gulp.watch(paths.assets.src, assets);
}

const build = gulp.series(gulp.parallel(compilePug, compileLess, scripts, images, assets));
const watch = gulp.series(build, watchFiles);

export { compilePug, compileLess, scripts, images, assets, watch };
export default build;
/* jshint node: true, esversion: 2015, asi: true */
'use strict'

const
    gulp = require('gulp'),
    opn = require('opn'),
    path = require('path'),
    del = require('del'),
    typescript = require('gulp-typescript'),
    tslint = require('gulp-tslint'),
    sourcemaps = require('gulp-sourcemaps'),
    connect = require('gulp-connect'),
    istanbul = require('gulp-istanbul'),
    remapIstanbul = require('remap-istanbul/lib/gulpRemapIstanbul'),
    mocha = require('gulp-mocha')

const paths = {
    src: 'src/**/*.ts',
    spec: 'spec/**/*.spec.ts',
    temp: 'temp/',
    dist: 'dist'
}

gulp.task('clean:temp', () => {
    return del([path.join(paths.temp, '**')])
})

gulp.task('clean:coverage', () => {
    return del([path.join('coverage', '**')])
})

gulp.task('test:precompile-sources', ['clean:temp'], () => {
    return gulp.src(paths.src)
        .pipe(sourcemaps.init())
        .pipe(typescript({
            module: 'commonjs',
            noImplicitAny: true,
            target: 'es6',
            moduleResolution: 'node'
        }))
        .pipe(sourcemaps.write())
        .pipe(gulp.dest(path.join(paths.temp, 'src')))
})

gulp.task('test:precompile-spec', ['clean:temp'], () => {
    return gulp.src(paths.spec)
        .pipe(sourcemaps.init())
        .pipe(typescript({
            module: 'commonjs',
            noImplicitAny: true,
            target: 'es6',
            moduleResolution: 'node'
        }))
        .pipe(sourcemaps.write())
        .pipe(gulp.dest(path.join(paths.temp, 'spec')))
})

gulp.task('test:instrument', ['test:precompile-sources'], () => {
    return gulp.src([path.join(paths.temp, 'src', '**', '*.js')])
        .pipe(sourcemaps.init({loadMaps: true}))
        .pipe(istanbul())
        .pipe(sourcemaps.write('.'))
        .pipe(istanbul.hookRequire())
})

gulp.task('test:run', ['test:instrument', 'clean:coverage'], () => {
    return gulp.src([path.join(paths.temp, 'spec', '**', '*.spec.js')], {read: false})
        .pipe(mocha())
        .pipe(istanbul.writeReports())
})

gulp.task('test:remap', ['test:run'], () => {
    return gulp.src(path.join('coverage', 'coverage-final.json'))
        .pipe(remapIstanbul({
            reports: {
                'json': 'coverage/remapped/coverage.json',
                'html': 'coverage/remapped/html-report'
            }
        }))
})

gulp.task('test:style-guide', () => {
    return gulp.src([paths.src, paths.spec])
        .pipe(tslint({
            configuration: "tslint.json"
        }))
        .pipe(tslint.report())
})

gulp.task('test', ['test:precompile-spec', 'test:precompile-sources', 'test:instrument', 'test:run', 'test:remap'])

gulp.task('watch:tests', () => {
    gulp.watch([paths.src, paths.spec], ['test', 'test:style-guide', 'coverage:live-reload'])
})

gulp.task('coverage:server', ['test'], () => {
    connect.server({
        root: path.join('coverage', 'remapped', 'html-report'),
        livereload: true,
        port: 12345
    })
})

gulp.task('coverage:live-reload', ['test'], () => {
    return gulp.src(path.join('coverage', 'remapped', 'html-report', '**', '*.html'))
        .pipe(connect.reload())
})

gulp.task('coverage:open', ['coverage:server'], () => {
    opn('http://localhost:12345');
})

gulp.task('watch', ['watch:tests'])

gulp.task('build', () => {
    return gulp.src(paths.src)
        .pipe(sourcemaps.init())
        .pipe(typescript({
            module: 'commonjs',
            noImplicitAny: true,
            target: 'es5',
            moduleResolution: 'node'
        }))
        .pipe(sourcemaps.write())
        .pipe(gulp.dest(path.join('dist', 'src')))
})

gulp.task('default', ['test', 'coverage:server', 'coverage:open', 'watch', 'test:style-guide'])

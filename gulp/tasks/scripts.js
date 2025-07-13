// scripts.js
import { src, dest } from 'gulp';
import * as util from './common.js';
import gulpif from 'gulp-if';
import terser from 'gulp-terser';
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';

const config = util.getConfig('gulp.config.json');
const argv = yargs(hideBin(process.argv)).argv;

function buildScripts(callback) {
  return src([globalThis.SOURCES_BASE_PATH + '/js/**/*.js'])
    .pipe(gulpif(argv.prod, terser())) 
    .pipe(dest(globalThis.BASE_PATH + '/dist/js'))
    .pipe(globalThis.CONNECT.reload());
}

export { buildScripts };
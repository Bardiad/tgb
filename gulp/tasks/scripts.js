import { src, dest, series } from 'gulp';
import fs from 'fs';


import * as util from './common.js';
const config = util.getConfig('gulp.config.json');

function buildScripts(callback) {


  return src([
    globalThis.SOURCES_BASE_PATH + '/js/**/*.js'
  ])
    .pipe(dest(globalThis.BASE_PATH + '/dist/js'))
    .pipe(globalThis.CONNECT.reload());
}

// ESM Exports
export { buildScripts };
import { watch, series, src, dest, parallel } from 'gulp';
import fs from 'fs';
import clean from 'gulp-clean';
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import { stream as criticalStream } from 'critical';

import * as util from './gulp/tasks/common.js';
import * as html_tasks from './gulp/tasks/html.js';
import * as sass_tasks from './gulp/tasks/scss.js';
import * as img_tasks from './gulp/tasks/imgs.js';
import * as js_tasks from './gulp/tasks/scripts.js';
import { revision, revUpdateRefs } from './gulp/tasks/rev.js';

import connect from 'gulp-connect';

const config = util.getConfig('gulp.config.json');


globalThis.CONNECT = connect;
globalThis.BASE_PATH = process.cwd();
globalThis.SOURCES_BASE_PATH = globalThis.BASE_PATH + config.project.source;
globalThis.BUILD_PATH = globalThis.BASE_PATH + config.project.destination;

const _buildHTML     = html_tasks.buildHTML;
const _buildStyles   = sass_tasks.buildCSS;
const _optimizeImgs  = img_tasks.optimizeImg;
const _buildScripts  = js_tasks.buildScripts;

function _startConnect(callback) {
  globalThis.CONNECT.server({
    port: 8000,
    root: globalThis.BUILD_PATH,
    host: '0.0.0.0',
    fallback: globalThis.BUILD_PATH + "/404.html",
    livereload: true
  });
  callback();
}

function inlineCriticalCSS() {
  return src('dist/**/*.html')
    .pipe(
      criticalStream({
        base: 'dist/',
        inline: true,
        css: ['dist/css/main.css'],
        dimensions: [                        
          { width: 320,  height: 480  },
          { width: 768,  height: 1024 },
          { width: 1200, height: 900  }
        ],
        extract: false                      
      })
    )
    .pipe(dest('dist'));                     // overwrite the HTML in place
}

function _clean(callback) {

  return src(
    [globalThis.BUILD_PATH],
    { read: false, allowEmpty: true }
  ).pipe(clean());
}

function _cleanRevs() {
  return src(
    [
      'css/*-??????????.css',
      'js/*-??????????.js',
      'img/**/*-??????????.@(png|jpg|jpeg|svg|gif)'    
    ],
    { cwd: globalThis.BUILD_PATH,
      read: false,
      allowEmpty: true }
  ).pipe(clean({ force: true }));
}

function _copyOldSite() {
  return src('old/**/*', { base: 'old', encoding: false }) // preserve folder structure
    .pipe(dest(globalThis.BASE_PATH + '/dist/old'));
}

function _watchFiles(callback) {
  console.log("Watching files...");
  watch(config.project.watch, _buildTasks);
  callback();
}

const _buildTasks = series(_clean, _optimizeImgs, _buildStyles, _buildHTML, _buildScripts, _copyOldSite);
const _serve      = parallel(_buildTasks, _startConnect, _watchFiles);
const _deployTasks = series(_cleanRevs, revision, revUpdateRefs, inlineCriticalCSS);

// Task exports
export default _serve;
export { _serve as serve };
export { _watchFiles as watch };
export { _clean as clean };
export { _cleanRevs as cleanRevs };
export { _startConnect as connect };

export { _buildHTML as "build:html" };
export { _buildStyles as "build:css" };
export { _buildTasks as "build:all" };
export {_copyOldSite as "copy:old"};
export {_deployTasks as 'prep:deploy'};


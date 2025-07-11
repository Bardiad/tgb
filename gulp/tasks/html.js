import { src, dest, series } from 'gulp';
import fs from 'fs';
import nunjucks from 'gulp-nunjucks-render';
import rename from 'gulp-rename';
import graymatter from 'gulp-gray-matter';

import * as util from './common.js';
const config = util.getConfig('gulp.config.json');

function getEnvironment() {
  return function (environment) {
    const data = {
      META: util.getData('data.meta.json'),
      CONTENT: util.getData('data.content.json'),
      POSTS: util.getData('data.posts.json'),
    };

    environment.addGlobal('data', data);
  };
}

function buildHTML(callback) {

  const nunjucksEnv = getEnvironment();

  return src([
    globalThis.SOURCES_BASE_PATH + '/index.njk',
    globalThis.SOURCES_BASE_PATH + '/pages/**/*.njk',
  ])
    .pipe(graymatter())
    .pipe(nunjucks({
      path: [globalThis.SOURCES_BASE_PATH + '/templates/'],
      manageEnv: nunjucksEnv,
    }))
    .pipe(dest(globalThis.BASE_PATH + '/dist/'))
    .pipe(globalThis.CONNECT.reload());
}

// ESM Exports
export { buildHTML, getEnvironment };
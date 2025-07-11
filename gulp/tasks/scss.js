import { src, dest } from 'gulp';
import fs from 'fs';
import path from 'path';
import postcss from 'gulp-postcss';
import autoprefixer from 'autoprefixer';
import * as dartSass from 'sass';
import gulpSass from 'gulp-sass';

import * as util from './common.js';
const config = util.getConfig('gulp.config.json');

const sass = gulpSass(dartSass);
const opts = { outputStyle: 'expanded' };

function _generateIndex(folder) {

  const files = fs.readdirSync(folder);
  const forwardLines = files
    .filter(file =>
      file.endsWith(".scss") &&
      file !== "_index.scss" &&
      !file.startsWith('.') &&
      fs.statSync(path.join(folder, file)).isFile()
    )
    .map(file => {
      const basename = file.replace(".scss", "");
      if (basename.startsWith("tokens.")) {
        return `@forward '${basename}' as token-*;`;
      }
      return `@forward '${basename}';`;
    })
    .join("\n");

  const banner = `// This file is auto-generated. Do not edit directly.\n`;
  const content = banner + forwardLines;
  const indexPath = path.join(folder, "_index.scss");

  if (!fs.existsSync(indexPath) || fs.readFileSync(indexPath, 'utf8') !== content) {
    fs.writeFileSync(indexPath, content);
  }
}

function _walkScssFolders(rootDir, callback, skipRoot = true) {

  const entries = fs.readdirSync(rootDir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(rootDir, entry.name);

    if (entry.isDirectory()) {
      _walkScssFolders(fullPath, callback, false);
    } else if (!skipRoot && entry.name.endsWith(".scss") && entry.name !== "_index.scss") {
      callback(rootDir);
      break;
    }
  }

  if (!skipRoot) {
    const hasScss = entries.some(entry =>
      entry.isFile() &&
      entry.name.endsWith(".scss") &&
      entry.name !== "_index.scss"
    );

    if (hasScss) {
      callback(rootDir);
    }
  }
}

function buildCSS(callback) {

  _walkScssFolders("./src/styles", _generateIndex);

  return src("./src/styles/main.scss")
    .pipe(sass.sync(opts).on('error', sass.logError))
    .pipe(postcss([autoprefixer()], { browsers: ['last 2 versions', 'ie > 10'] }))
    .pipe(dest([config.project.outputs.css]));
}

export { buildCSS };
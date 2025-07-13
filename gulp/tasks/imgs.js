import { src, dest } from 'gulp';
import imagemin from 'gulp-imagemin';
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import newer from 'gulp-newer';
import gulpif from "gulp-if";
import * as util from './common.js';

const config   = util.getConfig('gulp.config.json');
const argv = yargs(hideBin(process.argv)).argv;

function _optimizeImgs(callback) {
    const srcPath = global.SOURCES_BASE_PATH + '/img/**/*';
    const destPath = global.BASE_PATH + '/dist/img';

    return src(srcPath, { encoding: false })
    .pipe(newer(destPath)) 
    .pipe(gulpif(argv.prod, imagemin()))
    .pipe(dest(destPath));
}

export { _optimizeImgs as optimizeImg };

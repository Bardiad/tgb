import { src, dest } from 'gulp';
import imagemin from 'gulp-imagemin';
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import gulpif from "gulp-if";
import * as util from './common.js';


const config   = util.getConfig('gulp.config.json');
const argv = yargs(hideBin(process.argv)).argv;

function _optimizeImgs(callback) {

    return src( global.SOURCES_BASE_PATH + '/img/**/*', {encoding: false} )
    .pipe( gulpif(argv.prod, imagemin()) )
    .pipe( dest( global.BASE_PATH + "/dist/img" ) )
}

export { _optimizeImgs as optimizeImg };

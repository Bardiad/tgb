// gulp/tasks/rev.js
import { src, dest } from 'gulp';
import rev        from 'gulp-rev';
import revReplace from 'gulp-rev-replace';

export function revision() {
  return src(
      [
        // grab all your built assets…
        'dist/css/*.css',
        'dist/js/*.js',
        'dist/img/**/*.{png,jpg,jpeg,svg,gif}',

        // …but exclude any that already have a -<8-hex> fingerprint
        '!dist/css/*-[0-9a-f][0-9a-f][0-9a-f][0-9a-f][0-9a-f][0-9a-f][0-9a-f][0-9a-f].css',
        '!dist/js/*-[0-9a-f][0-9a-f][0-9a-f][0-9a-f][0-9a-f][0-9a-f][0-9a-f][0-9a-f].js',
        '!dist/img/**/*-[0-9a-f][0-9a-f][0-9a-f][0-9a-f][0-9a-f][0-9a-f][0-9a-f][0-9a-f].{png,jpg,jpeg,svg,gif}'
      ],
      { base: 'dist', encoding: false }
    )
    .pipe(rev())
    .pipe(dest('dist'))
    .pipe(rev.manifest('rev-manifest.json'))
    .pipe(dest('dist'));
}

export function revUpdateRefs() {
  const manifest = src('dist/rev-manifest.json');

  return src(
      [
        'dist/**/*.html',
        'dist/css/**/*.css'
      ],
      { base: 'dist' }
    )
    .pipe(
      revReplace({
        manifest,
        replaceInExtensions: ['.html', '.css']
      })
    )
    .pipe(dest('dist'));
}
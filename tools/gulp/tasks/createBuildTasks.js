const gulp = require("gulp");
const runCopyTask = require("../quench/runCopyTask.js");
const runJsTask = require("../quench/runJsTask.js");
const runSassTask = require("../quench/runSassTask.js");
const runSvgSpriteTask = require("../quench/runSvgSpriteTask.js");

const normalize = require("node-normalize-scss").includePaths;

module.exports = function createBuildTasks({ assetsDir, buildDir }) {

  const copy = () =>
    runCopyTask({
      src: [`${assetsDir}/fonts/**/*`, `${assetsDir}/img/**/*`],
      dest: `${buildDir}`,
      base: `${assetsDir}`
    });

  const sprite = () =>
    runSvgSpriteTask({
      src: `${assetsDir}/img/svg-sprite/**/*`,
      dest: `${buildDir}/img`,
      watch: `${assetsDir}/img/svg-sprite/**/*`
    });

  const js = () =>
    runJsTask({
      dest: `${buildDir}/js/`,
      files: [
        {
          entry: `${assetsDir}/js/index.js`,
          filename: "index.js",
          watch: [`${assetsDir}/js/**/*.js`, `${assetsDir}/js/**/*.jsx`]
        }
      ]
    });

  const sass = () =>
    runSassTask({
      src: [`${assetsDir}/scss/*.scss`],
      dest: `${buildDir}/css/`,
      sass: {
        includePaths: [
          `${assetsDir}/js/thread/custom-vendor/slick-carousel/slick`
        ].concat(normalize)
      },
      watch: [`${assetsDir}/scss/**/*.scss`, `${assetsDir}/js/**/*.scss`]
    });

  return gulp.parallel(copy, sprite, js, sass);
};

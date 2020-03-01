const gulp = require("gulp");
const quench = require("../quench/quench.js");
const runBrowserSyncTask = require("../quench/runBrowserSyncTask.js");
const runPatternLabTask = require("../quench/runPatternLabTask.js");

const createBuildTasks = require("./createBuildTasks.js");

module.exports = function createPatternLabTasks({ frontendRoot }) {
  const labRoot = `${frontendRoot}/lab`;
  const assetsDir = `${frontendRoot}/assets`;
  const buildDir = `${frontendRoot}/lab/public/assets`;

  const buildTasks = createBuildTasks({ assetsDir, buildDir });

  const patternLab = () =>
    runPatternLabTask({
      labRoot,
      watch: `${labRoot}/source/**`
    }).catch(err => {
      console.log("runPatternLabTask", JSON.stringify(err));
    });

  const browserSync = () =>
    runBrowserSyncTask({
      server: `${labRoot}/public`,
      files: [
        // reload when patternlab finishes building new patterns
        `${labRoot}/public/latest-change.txt`,
        `${buildDir}/js/**`,
        `${buildDir}/css/index-generated.css`,
        "!**/*.map"
      ]
    });

  const patternLabTasks = gulp.parallel(buildTasks, patternLab);

  if (quench.isWatching()) {
    return gulp.series(patternLabTasks, browserSync);
  } else {
    return patternLabTasks;
  }
};

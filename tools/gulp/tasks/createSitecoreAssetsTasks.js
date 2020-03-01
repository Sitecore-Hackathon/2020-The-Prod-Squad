const gulp = require("gulp");
const quench = require("../quench/quench.js");
const runBrowserSyncTask = require("../quench/runBrowserSyncTask.js");

const createBuildTasks = require("./createBuildTasks.js");

module.exports = function createSitecoreAssetsTasks({
  projectRoot,
  projectName
}) {
  // TODO do we need projectName at all?  Sync up with sitecore devs to see if
  // there is a more generic place to build to.
  const buildDir = `${projectRoot}/src/Project/${projectName}/code/assets/${projectName}-build/`;
  const assetsDir = `${projectRoot}/frontend/${projectName}/assets`;

  const buildTasks = createBuildTasks({ assetsDir, buildDir });

  // TODO configure to use with a dev proxy after issue #17 is resolved
  // https://github.com/Velir/frontend-starter/issues/17
  const browserSync = () =>
    runBrowserSyncTask({
      server: `${projectRoot}/src/Project/`,
      files: [
        `${projectRoot}/assets/js/**`,
        `${projectRoot}/assets/css/index-generated.css`,
        "!**/*.map"
      ]
    });

  if (quench.isWatching()) {
    return gulp.series(buildTasks, browserSync);
  }
  else {
    return buildTasks;
  }
};

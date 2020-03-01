const quench = require("./quench.js");
const exec = require("child_process").exec;
const R = require("ramda");

module.exports = function runPatternLabTask(userConfig) {
  const defaultConfig = {
    /**
     * src   : glob of files to copy
     * dest  : destination folder
     * base  : *optional, https://github.com/gulpjs/gulp/blob/master/docs/API.md#optionsbase
     * watch : *optional, files to watch that will trigger a rerun when changed
     *          defaults to src
     */
    labRoot: "./lab"
  };

  const config = R.mergeDeepRight(defaultConfig, userConfig);

  if (!config.labRoot) {
    quench.throwError(
      "Pattern lab requires a lab root directory.",
      `Was given ${JSON.stringify(config, null, 2)}`
    );
  }

  const patternLab = () => {
    return new Promise((resolve, reject) => {
      // can only run --patternsonly otherwise assets are removed from public.
      exec(
        `php ${config.labRoot}/core/console --generate --patternsonly`,
        (err, stdout, stderr) => {
          console.log(stdout);
          console.log(stderr);
          err ? reject(stderr) : resolve();
        }
      );
    });
  };

  // run this task and watch if specified
  quench.maybeWatch(config.watch || [], patternLab);

  return patternLab();
};

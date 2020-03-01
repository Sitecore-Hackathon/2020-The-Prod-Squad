const quench = require("./quench.js");
const R = require("ramda");
const chalk = require("chalk");
const browserSync = require("browser-sync");

module.exports = function runBrowserSyncTask(userConfig = {}) {
  const localJs = quench.loadLocalJs();

  if (!userConfig.server && !userConfig.proxy && !localJs.proxy) {
    quench.logYellow(
      "WARNING!",
      chalk.red("Browsersync was called but is not running!"),
      `Did you mean to add the ${chalk.cyan("--no-watch")} flag? \n\n`,
      `If not, make sure your provided a ${chalk.cyan("server")} path`,
      `or ${chalk.cyan("proxy")} in userConfig,`,
      `or a ${chalk.cyan("proxy")} defined in local.js!\n\n`,
      "userConfig passed to runBrowserSyncTask:",
      `${JSON.stringify(userConfig, null, 2)}\n`,
      `and config from local.js: ${JSON.stringify(localJs, null, 2)}`,
    );

    return;
  }

  const defaults = {
    port: localJs.browserSyncPort || userConfig.port || 3000,
    open: false, // false or  "external"
    notify: false,
    ghostMode: false,

    // watch these default files and reload the browser when they change
    // can be overwritten by userConfig
    files: userConfig.server
      ? [
        userConfig.server + "/**",
        // prevent browser sync from reloading twice when the regular file (eg. index.js)
        // and the map file (eg. index.js.map) are generated
        "!**/*.map",
      ]
      : undefined,

    // set the server root, or proxy if it's set in local.js
    // see https://github.com/Velir/frontend-starter/blob/master/gulp/readme.md#runbrowsersynctaskjs
    //
    // don't run a proxy if a server is set.
    //   - A developer might have a proxy set in local.js for task A, but are trying
    //     to run task B, which uses a server, not a proxy.
    proxy: userConfig.server
      ? undefined
      : localJs.proxy || userConfig.proxy || undefined,

    // use this if you want to proxy a dev server and serve certain files from
    // your local machine. eg:
    //   "serveStatic": [{
    //     "route": "/styles",
    //     "dir": "/path/to/project/styles"
    //   }]
    // https://browsersync.io/docs/options#option-serveStatic
    serveStatic: [],

    // https://browsersync.io/docs/options#option-serveStaticOptions
    // serveStaticOptions: {}

    // if not using proxy, use userConfig.server as the server root
    // http://www.browsersync.io/docs/options/#option-server
    // server: "path/to/build/"
  };

  // proxy/port is taken care of in the defaults
  const browserSyncSettings = R.mergeDeepRight(
    defaults,
    R.omit(["proxy", "port"], userConfig),
  );

  // only run browser-sync if we're also watching
  if (quench.isWatching()) {
    // don't fail if files isn't defined
    if (browserSyncSettings.files) {
      quench.logYellow(
        "watching",
        "browserSync:",
        JSON.stringify(browserSyncSettings.files, null, 2),
      );
    }

    const handleError = error => {
      quench.throwError(
        "There was an error starting browser sync.  Is there something wrong with your settings?\n ",
        chalk.white("browserSyncSettings: "),
        chalk.white(JSON.stringify(browserSyncSettings, null, 2)),
        "\n\n",
        error,
        "\n",
      );
    };
    try {
      // returning a promise for gulp 4
      // https://gulpjs.com/docs/en/getting-started/async-completion
      return new Promise((resolve, reject) => {
        const bs = browserSync.create();
        bs.init(browserSyncSettings, () => resolve(bs));
      }).catch(handleError);
    }
    catch (error) {
      handleError(error);
    }
  }
  else {
    quench.logYellow(
      "WARNING!",
      chalk.red("Browsersync task was called, but watch is false."),
    );
    return Promise.resolve();
  }
};

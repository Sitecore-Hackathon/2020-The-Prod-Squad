/**
 *  See ./readme.md for usage
 **/
const exec = require("child_process").exec;
const quench = require("./quench/quench.js");
const fs = require("fs");
const yargs = require("yargs").argv;
const gulp = require("gulp");
const gulpReplace = require('gulp-token-replace');
const mergeJson = require('gulp-merge-json');
const velocity = require('velocity');
const through = require('through2');
const runSequence = require('gulp4-run-sequence');
var rename = require("gulp-rename");

const projectRoot = quench.resolvePath(__dirname, "../..");

const createSitecoreAssetsTasks = require("./tasks/createSitecoreAssetsTasks.js");
const createPatternLabTasks = require("./tasks/createPatternLabTasks.js");

/**
 * gulp sitecore
 * to build for production/jenkins:
 *    node_modules/.bin/gulp sitecore --no-watch --env production
 */
const sitecoreGraybox = createSitecoreAssetsTasks({
    projectRoot,
    projectName: "Graybox"
});
sitecoreGraybox.description = "Build frontend assets for Sitecore Gray";
exports["sitecore-graybox"] = sitecoreGraybox;

const sitecoreDemo = createSitecoreAssetsTasks({
    projectRoot,
    projectName: "Demo"
});
sitecoreDemo.description = "Build frontend assets for Sitecore Demo";
exports["sitecore-demo"] = sitecoreDemo;

gulp.task("fe-build", gulp.series(sitecoreDemo, sitecoreGraybox));

/**
 * gulp patternlab
 */
const patternlabGray = createPatternLabTasks({ frontendRoot: `${projectRoot}/frontend/graybox` });
patternlabGray.description = "Build Gray Box Pattern Lab site";
exports["pl-graybox"] = patternlabGray;

const patternlabDemo = createPatternLabTasks({ frontendRoot: `${projectRoot}/frontend/demo/` });
patternlabDemo.description = "Build Demo Pattern Lab site";
exports["pl-demo"] = patternlabDemo;


const nantInit = cb => {
    return new Promise((resolve, reject) => {
        const env = yargs.environment || "local";
        exec("nant init -D:env=" + env, function(err, stdout, stderr) {
            console.log(stdout);
            console.log(stderr);
            err ? reject(stderr) : resolve();
        });
    });
};
nantInit.description = "Apply environment-specific variables";
exports["Nant-Init"] = nantInit;

const runCodeGen = cb => {
    return new Promise((resolve, reject) => {
        const basePath = ".\\src\\Foundation\\CodeGen\\code";
        const watch = yargs.watch ? " /w" : "";
        exec(
            basePath +
            "\\bin\\Debug\\Leprechaun.Console.exe /c " +
            basePath +
            "\\Leprechaun.config /g" +
            watch,
            function(err, stdout, stderr) {
                console.log(stdout);
                console.log(stderr);
                err ? reject(stderr) : resolve();
            }
        );
    });
};
runCodeGen.description = "Run Leprauchaun code-gen";
exports["Run-CodeGen"] = runCodeGen;

/* gulp */
// gulp.task("default", quench.logHelp);
exports.default = quench.logHelp;

if (fs.existsSync(quench.resolvePath(__dirname, "./tasks/helix/helix-config.js"))) {
    // helix tasks attach themselves to gulp
    require("./tasks/helix/helixTasks.js");
}

/*****************************
  Configuration
*****************************/
gulp.task('Configure-All', function(callback) {
    return runSequence(
        "Merge-Configuration",
        "Process-Velocity-Templates",
        callback);
});

gulp.task("Merge-Configuration", function() {
    var defaultConfig = require(`${projectRoot}/config/default.json`);
    var environmentConfigPath = yargs.env !== undefined ? `${projectRoot}/config/` + yargs.env + '.json' : `${projectRoot}/config/local.json`;
    return gulp.src(getConfigArray(environmentConfigPath))
        .pipe(mergeJson({
            startObj: defaultConfig,
            filename: "combined.json"
        }))
        .pipe(gulp.dest(`${projectRoot}/config/`))
        .pipe(renderTemplate())
        .pipe(gulp.dest(`${projectRoot}/config/`));
});

var getConfigArray = function(envConfigPath) {
    var includeConfig = '';
    var configPaths = [];
    do {
        configPaths.push(envConfigPath);
        var config = require(envConfigPath);
        includeConfig = config['Include'];
        envConfigPath = `${projectRoot}/config/` + includeConfig;
    }
    while (includeConfig !== undefined);
    return configPaths.reverse();
};

gulp.task('Process-Velocity-Templates', function() {
    return gulp.src([`${projectRoot}/**/*.template`, '!node_modules/**/*'])
        .pipe(renderTemplate())
        .pipe(rename({
            extname: ""
        }))
        .pipe(gulp.dest(`${projectRoot}/`));
});

var renderTemplate = () => {
    return through.obj((file, enc, cb) => {
        var context = fs.readFileSync(`${projectRoot}/config/combined.json`, "utf8");
        var engine = new velocity.Engine({
            template: file.path
        });
        file.contents = Buffer.from(engine.render(context));
        return cb(null, file);
    });
};
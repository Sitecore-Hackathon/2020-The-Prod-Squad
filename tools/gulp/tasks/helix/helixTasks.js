var gulp = require("gulp");
var msbuild = require("gulp-msbuild");
var debug = require("gulp-debug");
var foreach = require("gulp-foreach");
var watch = require("gulp-watch");
var util = require("gulp-util");
var config = {};
var nugetRestore = require('gulp-nuget-restore');
var yargs = require("yargs").argv;
var unicorn = require("./unicorn.js");
var quench = require("../../quench/quench.js");
const fs = require("fs");
var changed = require("gulp-changed");

if (fs.existsSync(quench.resolvePath(__dirname, "./helix-config.js"))) {
    config = require('./helix-config.js')();
}

module.exports.config = config;

/*****************************
  Initial setup
*****************************/
const nuget = (cb) => {
    return new Promise((resolve, reject) => {
        var solution = "./" + config.solutionName + ".sln";
        gulp.src(solution).pipe(nugetRestore());
        resolve();
    });
};
nuget.description = "Restore NuGet packages for the solution";
gulp.task("Nuget-Restore", nuget);

const fastPublish = (cb) => {
    var solution = "./" + config.solutionName + ".sln";
    return gulp.src(solution)
        .pipe(msbuild({
            targets: ["Build"],
            configuration: config.buildConfiguration,
            logCommand: false,
            verbosity: config.buildVerbosity,
            stdout: true,
            errorOnFail: true,
            maxcpucount: config.buildMaxCpuCount,
            nodeReuse: false,
            toolsVersion: config.buildToolsVersion,
            customArgs: ['/p:DeployOnBuild=true', '/p:PublishProfile=Local']
        }));
};
gulp.task("Fast-Publish", fastPublish);
gulp.task("Publish-All-Projects", fastPublish);

const xmlTransform = (cb) => {
    var layerPathFilters = ["./src/Foundation/**/*.transform", "./src/Feature/**/*.transform", "./src/Project/**/*.transform", "!./src/**/obj/**/*.transform", "!./src/**/bin/**/*.transform"];
    return gulp.src(layerPathFilters)
        .pipe(foreach(function(stream, file) {
            var fileToTransform = file.path.replace(/.+code\\(.+)\.transform/, "$1");
            util.log("Applying configuration transform: " + file.path);
            return gulp.src("./tools/gulp/tasks/helix/applytransform.targets")
                .pipe(msbuild({
                    targets: ["ApplyTransform"],
                    configuration: config.buildConfiguration,
                    logCommand: false,
                    verbosity: config.buildVerbosity,
                    stdout: true,
                    errorOnFail: true,
                    maxcpucount: config.buildMaxCpuCount,
                    nodeReuse: false,
                    toolsVersion: config.buildToolsVersion,
                    properties: {
                        Platform: config.buildPlatform,
                        WebConfigToTransform: config.websiteRoot,
                        TransformFile: file.path,
                        FileToTransform: fileToTransform
                    }
                }));
        }));
};
gulp.task("Apply-Xml-Transform", xmlTransform);

const deployTransforms = (cb) => {
    return gulp.src("./src/**/code/**/*.transform")
        .pipe(gulp.dest(config.websiteRoot + "/temp/transforms"));
};
gulp.task("Deploy-Transforms", deployTransforms);

const syncUnicorn = (cb) => {
    var options = {};
    options.siteHostName = config.siteUrl;
    options.authenticationConfigFile = config.websiteRoot + "/App_config/Include/Unicorn.SharedSecret.config";

    unicorn(function() { return cb() }, options);
};
gulp.task("Sync-Unicorn", syncUnicorn);

gulp.task("Deploy-Solution", gulp.series(nuget, fastPublish, xmlTransform, syncUnicorn));

/*****************************
  Publish
*****************************/
var publishStream = function(stream, dest) {
    var targets = ["Build"];

    return stream
        .pipe(debug({ title: "Building project:" }))
        .pipe(msbuild({
            targets: targets,
            configuration: config.buildConfiguration,
            logCommand: false,
            verbosity: config.buildVerbosity,
            stdout: true,
            errorOnFail: true,
            maxcpucount: config.buildMaxCpuCount,
            nodeReuse: false,
            toolsVersion: config.buildToolsVersion,
            properties: {
                Platform: config.publishPlatform,
                DeployOnBuild: "true",
                DeployDefaultTarget: "WebPublish",
                WebPublishMethod: "FileSystem",
                DeleteExistingFiles: "false",
                publishUrl: dest,
                _FindDependencies: "false",
                VisualStudioVersion: config.visualStudioVersion
            }
        }));
}

var publishProject = function(location, dest) {
    dest = dest || config.websiteRoot;

    console.log("publish to " + dest + " folder");
    return gulp.src(["./src/" + location + "/code/*.csproj"])
        .pipe(foreach(function(stream, file) {
            return publishStream(stream, dest);
        }));
}

var publishProjects = function(location, dest) {
    dest = dest || config.websiteRoot;

    console.log("publish to " + dest + " folder");
    return gulp.src([location + "/**/code/*.csproj"])
        .pipe(foreach(function(stream, file) {
            return publishStream(stream, dest);
        }));
};

gulp.task("Build-Solution", function() {
    var targets = ["Build"];
    if (config.runCleanBuilds) {
        targets = ["Clean", "Build"];
    }
    var solution = "./" + config.solutionName + ".sln";
    return gulp.src(solution)
        .pipe(msbuild({
            targets: targets,
            configuration: config.buildConfiguration,
            logCommand: false,
            verbosity: config.buildVerbosity,
            stdout: true,
            errorOnFail: true,
            maxcpucount: config.buildMaxCpuCount,
            nodeReuse: false,
            toolsVersion: config.buildToolsVersion,
            properties: {
                Platform: config.buildPlatform
            }
        }));
});

gulp.task("Publish-Foundation-Projects", function() {
    return publishProjects("./src/Foundation");
});

gulp.task("Publish-Feature-Projects", function() {
    return publishProjects("./src/Feature");
});

gulp.task("Publish-Project-Projects", function() {
    return publishProjects("./src/Project");
});

gulp.task("Publish-Project", function() {
    if (yargs && yargs.m && typeof(yargs.m) == 'string') {
        return publishProject(yargs.m);
    } else {
        throw "\n\n------\n USAGE: -m Layer/Module \n------\n\n";
    }
});

/*****************************
 Watchers
*****************************/
gulp.task("Auto-Publish-Changes", function() {
    const files = ["./src/**/*.{cshtml,svg,css,map,dll,pdb,config}",
        "./src/**/*-generated.js",
        "!./src/**/obj"
    ];
    const destination = config.websiteRoot;

    return watch(files, function(file) {
        // Each file should have it's own base dir value for copying
        // i.e., "src/Feature/
        const base = file.path.split("code")[0] + "code/";
        gulp.src(file.path, { base: base })
            .pipe(quench.drano())
            .pipe(changed(destination))
            .pipe(gulp.dest(destination))
            .pipe(debug({ title: "Auto-Publish-Changes" }));
    });

});
## Quench v5.0.0

- Adding `.babelrc` file instead of hardcoding the babel config inside of `createJsTask`.
- Upgrading babel to version 7.
- Renaming `createCssTask` to `createSassTask` to disambiguate between other css tasks.
- Removing `createJsConcatTask` in favor of configuring `createJsSimpleTask`.
- Fixing bug in `createBrowserSync` task so local.js `proxy` is respected
- Removing fileExists in favor of fs.existsSync
- Upgrading to Gulp 4
- Transpiling node_modules for IE compatibility

### v5.1.0

- Fixing bug with window machines not watching

### v5.2.0

- Adding react-hooks eslint rule

### v5.3.0

- Running quench files through prettier
- Addressing TODO in browser-sync task
- Adding glob support to match `.js` or `.jsx` files in `runJsTask.js`
- Updating readme with better Jenkins commands

### v5.4.0

- Adding task descriptions in `logHelp`

### v5.5.0

- Adding [eslint-plugin-jsx-a11y](https://github.com/evcohen/eslint-plugin-jsx-a11y)

### v5.5.1

- Moving browser list out of `runSassTask` and in to `.browserslistrc` [#21](https://github.com/Velir/frontend-starter/issues/21)
- Updating node modules and fixing breaking changes for `core-js` version 3

### v5.5.2

- Fixing bug with postcss ordering that cause autoprefixer grid to not add `-ms` prefixes.
- Updating autoprefixer default option to be `grid: "autoplace"` (see https://github.com/postcss/autoprefixer#grid-autoplacement-support-in-ie)

### v5.5.3

- Making `runJsTask.js` more robust by avoiding infinite loops with circular dependencies.
- Fixing IE bug in `runJsTask.js` with transpiling core-js (https://github.com/zloirock/core-js/issues/514#issuecomment-476533317)

### v5.6.0

- Replacing sass-lint with stylelint
- Updating some estlint rules
- Fixing bug with runBrowserSync when both a proxy and server and defined (https://github.com/Velir/frontend-starter/issues/29)

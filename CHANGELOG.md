# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/) and this
project adheres to [Semantic Versioning](http://semver.org/).

## [0.15.0] - 2021-02-05
### Added
- New advanced search features:
  - You can filter by any field at any level. For example
    `search.pages("header.categories=my-category")`
  - You can sort by any field at any level. For example
    `search.pages("header.categories=my-category", "my.custom.order.field")`
  - New method `search.data()` to return the data assigned to any page or
    directory.

### Changed
- Restore the ability to return the proper exit code on `lume --run`.
- Show more info on error.
- Removed the argument to ignore tags in `search.tags()`. Replaced by a filter like in `search.pages()`

### Removed
- The method `search.directory()` to return a directory instance. Use
  `search.data()`.
- The option `file` to sort results in `search.pages()`. Use `url` instead.

### Fixed
- Cache is not correctly refreshed when using different versions of plugins
  [#35]
- Updated dependencies
- Ensure the processors are executed in the same order they where declared
- `inline` plugin when the site location is in a subdirectory.

## [0.14.0] - 2021-02-02
### Changed
- API changes in the `Page` class:
  - Tags are stored as `Array` in `page.data.tags` (previously they are a `Set`
    in `page.tags`).
  - Removed `page.fullData` property, `page.data` contains the merged data.
- CLI changes [#33], [#34]:
  - Moved some options (arguments starting with `--`) to commands:
    - `lume --upgrade` to `lume upgrade`
    - `lume --update` to `lume update`
    - `lume --init` to `lume init`
    - `lume --run=<script>` to `lume run <script>`
  - Added command specific help info. For example: `lume run --help`
  - Changed the way to specify a different cwd. Instead `lume path/to/site`, use
    `lume --root=path/to/site`

### Fixed
- Link to docs in `--help` [#32]

## [0.13.2] - 2021-01-23
### Fixed
- Wrong default configuration in yaml plugin

## [0.13.1] - 2021-01-23
### Fixed
- Bug makes that postcss plugin doesn't process the css files

## [0.13.0] - 2021-01-20
### Added
- Normalize options across some plugins

### Changed
- Minimum required Deno version is `1.7.0`
- Temporary, `lume --run` doesn't return the proper exit code until
  [this bug in Deno](https://github.com/denoland/deno/issues/9201) is resolved

## [0.12.1] - 2021-01-16
### Added
- New command `lume --update` to update the lume version used by any
  `_config.js` file to the same installed globally in cli.

### Fixed
- Cache in `search` helper that returns the original array instead a clone, so
  it can be modified outside.
- Uncaught exception in the built-in server due a Broken Pipe

## [0.12.0] - 2021-01-15
### Added
- New filter `njk` registered by the `nunjucks` plugin
- Moved `url` filter to a plugin that also created an additional filter
  `htmlUrl` to search and fix urls in html code
- New plugin `date` to manage date and time values using the library
  [date-fns](https://date-fns.org)
- The order option of `search.pages()` accepts any value key (in addition to
  `date` and `file`)

### Changed
- Moved `attributes` and `classname` to the new `attributes` plugin and enable
  it by default.

### Fixed
- Url filter with `null` values
- Improved performance of `search.pages()` by implementing a cache system.
- Improved performance of data and tags merging by implementing a cache system.

## [0.11.0] - 2021-01-12
### Added
- New plugin `inline`
- New plugin `terser` [#29], [#30]

### Changed
- Renamed the plugin `css` to `postcss` and some of its options:
  - `map` was renamed to `sourceMap`
  - `postcssPlugins` was renamed to `plugins`

### Fixed
- Some files (like layouts) were loaded multiple times. Implemented a cache
  system to ensure that every file is read only once.

## [0.10.8] - 2021-01-03
### Fixed
- Sometimes, live reload doesn't reload the page, even if the changes are sent
  to the browser. [#20]

## [0.10.7] - 2021-01-02
### Added
- Support for async filters [#22]
- The events `beforeUpdate` and `afterUpdate` have the property `files` with the
  names of all changed files.
- Allow to configure the css plugins with the following options
  - `postcssPlugins`: array with the PostCSS plugins [#26]
  - `map`: set `true` to generate source map
- Ability to add/remove dynamically pages from processors

### Fixed
- Websocket sends update messages twice
- `paginate` helper doesn't return always the latest page
- Dispatch events that contains scripts should return false if the script fails

## [0.10.6] - 2020-12-27
### Fixed
- Multipage generation workflow
- Websocket random errors on reload changes

## [0.10.5] - 2020-12-25
### Fixed
- Unknown option `--location`

## [0.10.4] - 2020-12-24
### Fixed
- Ensure page tags are always converted to strings
- The template cache is not always updated

## [0.10.3] - 2020-12-21
### Fixed
- TypeError in the server reload script
- Removed extra space on parse the frontmatter
- Improved `Pug` plugin. Fixed Typescript errors due conflicts with Eta [#18],
  added cache for the compiled templates and improved filters.
- Added hot reloading for modules (ts, js) and fixed some issues.
- Undocumented `data` filter is disabled by default.

## [0.10.2] - 2020-12-17
### Fixed
- Do not add `.html` extension to files with a subextension. For example
  `scripts.js.njk` should be saved to `scripts.js` instead `scripts.js.html`
  [#13].
- Refresh Deno cache with `lume --upgrade`

## [0.10.1] - 2020-12-16
### Fixed
- Markdown error handling `<pre>` elements

## [0.10.0] - 2020-12-16
### Added
- New plugin to use `Pug` as a template engine [#10]
- New functions `search.previousPage()` and `search.nextPage()`
- Support for definition lists (`<dl>`) in markdown
- Improved default `404` error page. Now it displays a list of files and
  subfolders
- New option `templateEngine` to configure the template engine used for every
  page [#11]

### Fixed
- Live reload didn't work always with html
- HTTP server timeout on missing `/index.html`
- Nunjucks cache doesn't detect changes in included templates
- Fixed version display on upgrade [#9]
- `url` filter in markdown
- `url` filter handling hashes and queries (for example `#hashid` and
  `?query=value`)

## [0.9.12] - 2020-12-07
### Fixed
- css plugin use only import and nesting plugins because the other plugins fails
  in Deno.

## [0.9.11] - 2020-12-06
### Fixed
- Fixed `lume --upgrade` error

## [0.9.10] - 2020-12-06
### Fixed
- Updated dependencies

## [0.9.9] - 2020-12-01
### Fixed
- Asyncronous scripts runner: Don't exit before all promises are resolved [#7].
- Improved `--upgrade` command.

## [0.9.8] - 2020-12-01
### Fixed
- Removed failing dependency

## [0.9.7] - 2020-12-01
### Added
- Support for executing javascript functions in `deno.script()` instead only cli
  command
- New cli arguments `--src`, `--dest` to change dinamically the src and dest
  options.
- New property `site.flags` that save all arguments after `--`. For example:
  `lume --serve -- flag1 flag2`.

### Fixed
- Fixed multi-commands scripts in linux [#7]
- Replaced `dev.jspm.io` dependencies with `jspm.dev`.
- Replaced `denopkg.com` dependencies with `cdn.jsdelivr.net` [#8].
- Updated `highlight.js` to 10.x

## [0.9.6] - 2020-11-28
### Fixed
- Fixed multipage with generators and add support for async generators
- Updated dependencies
- Simplify the code generated by `lume --init`
- Fixed multi-commands with `&&` and `&` [#7]

## [0.9.5] - 2020-11-25
### Added
- Predefined values to `attr` filter.
- New option `server` to configure the local server: `port` and `page404`.

### Changed
- Removed documentation from the main repository

### Fixed
- Version number returned by `lume -v`.

## [0.9.4] - 2020-11-20
### Fixed
- BrokenPipe errors in the server

## [0.9.3] - 2020-11-13
### Fixed
- Version number returned by `lume -v`.

## [0.9.2] - 2020-11-13
### Added
- `--upgrade` command.

### Changed
- Renamed the shortcut for `--version`, `-V` to `-v`.

### Fixed
- `denjunks` installation bug [#6]

## [0.9.1] - 2020-11-06
### Fixed
- `@import` css of the `css()` plugin, using `_includes` as fallback

## [0.9.0] - 2020-11-04
### Added
- New method `script()` to execute scripts like a task manager
- Allow to run scripts in events
- Autodiscover `404.html` file in the built-in server for 404 responses

### Fixed
- Ignore `node_modules` folder by default
- Show an error if the cwd is not a folder
- Enable `attr` filter by default

## [0.8.1] - 2020-10-28
### Added
- New method `ignore()` to ignore files and folders

### Fixed
- Version number on `lume --version`

## [0.8.0] - 2020-10-27
### Added
- New `loadAssets()` to register assets loaders
- New argument in CLI to build the site in a different directory and even choose
  a different _config.js file.

### Changed
- Renamed `load()` to `loadPages()` and removed the `asset` argument.
- Renamed `data()` to `loadData()`
- Renamed `helper()` to `data()`
- Updating files (in a watch process) dispatches the events `beforeUpdate` and
  `afterUpdate` (instead `beforeBuild` and `afterBuild`)

## [0.7.3] - 2020-10-17
### Changed
- Removed the version of the import in the `_config.js` file generated with
  `--init`

### Fixed
- Support for special characters in the url to the HTTP server
- Rebuild inside a try/catch to prevent die on error.

## [0.7.2] - 2020-10-10
### Fixed
- Updated version in cli

## [0.7.1] - 2020-10-10
### Fixed
- Permalinks does not respect the `prettyUrls` configuration [#1]
- Improved docs to update version

## [0.7.0] - 2020-10-09
### Added
- Added events: `beforeBuild` and `afterBuild`
- Added helper `paginate()`
- `site.process()` function
- New option `prettyUrls`. By default is `true`.

### Removed
- `site.beforeRender()` and `site.afterRender()` transformers. Use
  `site.process()` instead, that is the equivalent to `afterRender`.

### Fixed
- Improved performance executing some operations in parallel
- Fixed page duplications
- Fixed url filter with non-string values

## [0.6.0] - 2020-09-28
### Added
- New argument to `search.pages()` to sort pages alphabetically
- Added new argument `--help` and aliases `-h` and `-V` to cli
- Added `eta` plugin, to support `Eta` template engine
- New function `helper` to assign global helpers that can be used in the
  templates

### Removed
- Arguments `path` and `recursive` in `search.pages()`

### Fixed
- `url` filter with relative urls
- postcss incompatibility with deno

## [0.5.1] - 2020-09-25
### Fixed
- `version` variable

## [0.5.0] - 2020-09-24
### Added
- Ability to generate multiple pages using generators

### Changed
- Replaced `pathPrefix` and `url` with `location`

### Fixed
- `url` filter bugs

## [0.4.0] - 2020-09-22
### Added
- Ability to include the date in the filename
- New function `search.folder()`
- New option `--dev` to run in development mode

### Fixed
- Front matter detection
- Site rebuild after creating or removing directories and files
- Improved url filter
- Use content hash to detect real file changes
- Tags propagation
- Ensure beforeRender transformers are executed only once.

## [0.3.1] - 2020-09-19
### Fixed
- Use temporarily a fork of denjunks because loading bugs

## [0.3.0] - 2020-09-19
### Added
- New plugin `svg` to optimize svg files
- New plugin `dom` to manipulate html using the DOM api
- New filter `classname` to manipulate css classes
- New filter `attributes` to manipulate html attributes
- First tests

### Changed
- `explorer` was renamed to `search`

### Fixed
- Refactored source load and reload
- Explorer returns wrong results
- Live-reload bugs

## [0.2.3] - 2020-09-14
### Fixed
- Moved websocket script to server.js to avoid reading problems

## [0.2.2] - 2020-09-13
### Added
- New command `lumen --version`

### Fixed
- CLI installation

## [0.2.1] - 2020-09-13
### Fixed
- Module loader executed from remote (http://deno.land/x/lume)
- Use fixed versions for dependencies

## [0.2.0] - 2020-09-13
### Added
- New command `lume --init` to create a `_config.js` file.

### Changed
- Merged `postcss` and `stylecow` plugins in the new `css` plugin.

### Fixed
- JSX engine

## 0.1.0 - 2020-09-13
First version

[#1]: https://github.com/oscarotero/lume/issues/1
[#6]: https://github.com/oscarotero/lume/issues/6
[#7]: https://github.com/oscarotero/lume/issues/7
[#8]: https://github.com/oscarotero/lume/issues/8
[#9]: https://github.com/oscarotero/lume/issues/9
[#10]: https://github.com/oscarotero/lume/issues/10
[#11]: https://github.com/oscarotero/lume/issues/11
[#13]: https://github.com/oscarotero/lume/issues/13
[#18]: https://github.com/oscarotero/lume/issues/18
[#20]: https://github.com/oscarotero/lume/issues/20
[#22]: https://github.com/oscarotero/lume/issues/22
[#26]: https://github.com/oscarotero/lume/issues/26
[#29]: https://github.com/oscarotero/lume/issues/29
[#30]: https://github.com/oscarotero/lume/issues/30
[#32]: https://github.com/oscarotero/lume/issues/32
[#33]: https://github.com/oscarotero/lume/issues/33
[#34]: https://github.com/oscarotero/lume/issues/34
[#35]: https://github.com/oscarotero/lume/issues/35

[0.15.0]: https://github.com/oscarotero/lume/compare/v0.14.0...v0.15.0
[0.14.0]: https://github.com/oscarotero/lume/compare/v0.13.2...v0.14.0
[0.13.2]: https://github.com/oscarotero/lume/compare/v0.13.1...v0.13.2
[0.13.1]: https://github.com/oscarotero/lume/compare/v0.13.0...v0.13.1
[0.13.0]: https://github.com/oscarotero/lume/compare/v0.12.1...v0.13.0
[0.12.1]: https://github.com/oscarotero/lume/compare/v0.12.0...v0.12.1
[0.12.0]: https://github.com/oscarotero/lume/compare/v0.11.0...v0.12.0
[0.11.0]: https://github.com/oscarotero/lume/compare/v0.10.8...v0.11.0
[0.10.8]: https://github.com/oscarotero/lume/compare/v0.10.7...v0.10.8
[0.10.7]: https://github.com/oscarotero/lume/compare/v0.10.6...v0.10.7
[0.10.6]: https://github.com/oscarotero/lume/compare/v0.10.5...v0.10.6
[0.10.5]: https://github.com/oscarotero/lume/compare/v0.10.4...v0.10.5
[0.10.4]: https://github.com/oscarotero/lume/compare/v0.10.3...v0.10.4
[0.10.3]: https://github.com/oscarotero/lume/compare/v0.10.2...v0.10.3
[0.10.2]: https://github.com/oscarotero/lume/compare/v0.10.1...v0.10.2
[0.10.1]: https://github.com/oscarotero/lume/compare/v0.10.0...v0.10.1
[0.10.0]: https://github.com/oscarotero/lume/compare/v0.9.12...v0.10.0
[0.9.12]: https://github.com/oscarotero/lume/compare/v0.9.11...v0.9.12
[0.9.11]: https://github.com/oscarotero/lume/compare/v0.9.10...v0.9.11
[0.9.10]: https://github.com/oscarotero/lume/compare/v0.9.9...v0.9.10
[0.9.9]: https://github.com/oscarotero/lume/compare/v0.9.8...v0.9.9
[0.9.8]: https://github.com/oscarotero/lume/compare/v0.9.7...v0.9.8
[0.9.7]: https://github.com/oscarotero/lume/compare/v0.9.6...v0.9.7
[0.9.6]: https://github.com/oscarotero/lume/compare/v0.9.5...v0.9.6
[0.9.5]: https://github.com/oscarotero/lume/compare/v0.9.4...v0.9.5
[0.9.4]: https://github.com/oscarotero/lume/compare/v0.9.3...v0.9.4
[0.9.3]: https://github.com/oscarotero/lume/compare/v0.9.2...v0.9.3
[0.9.2]: https://github.com/oscarotero/lume/compare/v0.9.1...v0.9.2
[0.9.1]: https://github.com/oscarotero/lume/compare/v0.9.0...v0.9.1
[0.9.0]: https://github.com/oscarotero/lume/compare/v0.8.1...v0.9.0
[0.8.1]: https://github.com/oscarotero/lume/compare/v0.8.0...v0.8.1
[0.8.0]: https://github.com/oscarotero/lume/compare/v0.7.3...v0.8.0
[0.7.3]: https://github.com/oscarotero/lume/compare/v0.7.2...v0.7.3
[0.7.2]: https://github.com/oscarotero/lume/compare/v0.7.1...v0.7.2
[0.7.1]: https://github.com/oscarotero/lume/compare/v0.7.0...v0.7.1
[0.7.0]: https://github.com/oscarotero/lume/compare/v0.6.0...v0.7.0
[0.6.0]: https://github.com/oscarotero/lume/compare/v0.5.1...v0.6.0
[0.5.1]: https://github.com/oscarotero/lume/compare/v0.5.0...v0.5.1
[0.5.0]: https://github.com/oscarotero/lume/compare/v0.4.0...v0.5.0
[0.4.0]: https://github.com/oscarotero/lume/compare/v0.3.1...v0.4.0
[0.3.1]: https://github.com/oscarotero/lume/compare/v0.3.0...v0.3.1
[0.3.0]: https://github.com/oscarotero/lume/compare/v0.2.3...v0.3.0
[0.2.3]: https://github.com/oscarotero/lume/compare/v0.2.2...v0.2.3
[0.2.2]: https://github.com/oscarotero/lume/compare/v0.2.1...v0.2.2
[0.2.1]: https://github.com/oscarotero/lume/compare/v0.2.0...v0.2.1
[0.2.0]: https://github.com/oscarotero/lume/compare/v0.1.0...v0.2.0

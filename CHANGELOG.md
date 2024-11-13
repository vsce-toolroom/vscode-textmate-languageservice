# Changelog

## 4.0.0

<a href="https://code.visualstudio.com/updates/v1_55" target="_blank"><img src="https://github.com/vsce-toolroom/vscode-textmate-languageservice/raw/95579fa/assets/compatibility-badge.svg" /></a> <a href="https://github.com/vsce-toolroom/vscode-textmate-languageservice/tree/v4.0.0/"><img src="https://img.shields.io/static/v1.svg?style=flat-square&label=Release%20Date&message=2024-11-13&logo=googlecalendar&logoColor=cacde2&labelColor=333333&color=2196f3" /></a> <a href="https://github.com/vsce-toolroom/vscode-textmate-languageservice/milestone/10"><img src="https://img.shields.io/static/v1.svg?style=flat-square&label=Milestone&message=v4.0.0&logo=github&logoColor=cacde2&labelColor=333333&color=2196f3" /></a>

- Mark package support as LTS mode instead of maintenance mode.
- Add embedded language support.
- Add JSONC support for configuration files.
- Generate `vscode.TextDocument` mocks for document service output.
- Switch `LiteTextDocument` to `vscode.TextDocument` across the package.
- Allow the package to query embedded and builtin languages when extensions supply a `vscode.ExtensionContext`.
- Change contribution logic to prioritise a supplied extension `context` instead of restricting contributions to that extension.
- Export `ContributorData` - a utility for statically resolving language and grammar contributions.
- Patch `findLanguageIdFromScopeName` grammar priority to match core behaviour.
- Update API documentation to match 4.0.0.

## 3.0.1

<a href="https://code.visualstudio.com/updates/v1_55" target="_blank"><img src="https://github.com/vsce-toolroom/vscode-textmate-languageservice/raw/95579fa/assets/compatibility-badge.svg" /></a> <a href="https://github.com/vsce-toolroom/vscode-textmate-languageservice/tree/v3.0.1/"><img src="https://img.shields.io/static/v1.svg?style=flat-square&label=Release%20Date&message=2024-02-12&logo=googlecalendar&logoColor=cacde2&labelColor=333333&color=2196f3" /></a> <a href="https://github.com/vsce-toolroom/vscode-textmate-languageservice/milestone/9"><img src="https://img.shields.io/static/v1.svg?style=flat-square&label=Milestone&message=v3.0.1&logo=github&logoColor=cacde2&labelColor=333333&color=2196f3" /></a>

- Hotfix for type definitions missing in `3.0.0`.
- Smoke test types to ensure package build always includes type declarations.

## 3.0.0

<a href="https://code.visualstudio.com/updates/v1_55" target="_blank"><img src="https://github.com/vsce-toolroom/vscode-textmate-languageservice/raw/95579fa/assets/compatibility-badge.svg" /></a> <a href="https://github.com/vsce-toolroom/vscode-textmate-languageservice/tree/v3.0.0/"><img src="https://img.shields.io/static/v1.svg?style=flat-square&label=Release%20Date&message=2023-11-07&logo=googlecalendar&logoColor=cacde2&labelColor=333333&color=2196f3" /></a> <a href="https://github.com/vsce-toolroom/vscode-textmate-languageservice/milestone/8"><img src="https://img.shields.io/static/v1.svg?style=flat-square&label=Milestone&message=v3.0.0&logo=github&logoColor=cacde2&labelColor=333333&color=2196f3" /></a>

- **[BREAKING]** Rename `api.getLanguageConfiguration` to `api.getLanguageContribution`.
- **[BREAKING]** Rename `api.getGrammarConfiguration` to `api.getGrammarContribution`.
- Add `getLanguageConfiguration` API method to load `vscode.LanguageConfiguration`.
- Add `plaintext` language tokenization and grammar resolution.
- Hotfix for "unrecognized language" error for `plaintext` documents in API token methods.


## 2.0.0

<a href="https://code.visualstudio.com/updates/v1_55" target="_blank"><img src="https://github.com/vsce-toolroom/vscode-textmate-languageservice/raw/95579fa/assets/compatibility-badge.svg" /></a> <a href="https://github.com/vsce-toolroom/vscode-textmate-languageservice/tree/v2.0.0-recovery.1/"><img src="https://img.shields.io/static/v1.svg?style=flat-square&label=Release%20Date&message=2023-09-08&logo=googlecalendar&logoColor=cacde2&labelColor=333333&color=2196f3" /></a> <a href="https://github.com/vsce-toolroom/vscode-textmate-languageservice/milestone/7"><img src="https://img.shields.io/static/v1.svg?style=flat-square&label=Milestone&message=v2.0.0-recovery.1&logo=github&logoColor=cacde2&labelColor=333333&color=2196f3" /></a>

<p align="center"><img src="https://raw.githubusercontent.com/vsce-toolroom/vscode-textmate-languageservice/95579fa/assets/logo.png"/></p>

- **The VSCE Toolroom open-source collective has adopted the Textmate language service project!**
- Redesigned the logo, inspired by the V8 engine and the Textmate osteopermum flower.

- Languages can now be tokenized from built-in grammars as well as service-only grammars.
- Marked `TextmateLanguageService~context` parameter as optional in the API types.
- Marked the API from 1.0.0 as compatible with 1.55.0, not 1.51.0.
- Provided community resolution to microsoft/vscode#109919 & microsoft/vscode#99356.

- Implemented API methods in an `api` namespace for developer-friendly logic:
  - Add `getTokenInformationAtPosition` method for fast positional token polyfill: `vscode.TokenInformation`.
  - Add `getScopeInformationAtPosition` method to get Textmate token data: `TextmateToken`.
  - Add `getScopeRangeAtPosition` method to get token range: `vscode.Range`.
  - Add `getLanguageConfiguration` method for language configuration: `LanguageDefinition`.
  - Add `getGrammarConfiguration` method to get language grammar wiring: `GrammarLanguageDefinition`.
  - Add `getContributorExtension` method to get extension source of language ID: `vscode.Extension`.

- Linted the Textmate scope parser correctly & automatically in the test pipeline.
- Added `getOniguruma` to API utilities, a browser-ready non-streaming build of `vscode-oniguruma`.

## 1.2.1

<a href="https://code.visualstudio.com/updates/v1_55" target="_blank"><img src="https://github.com/vsce-toolroom/vscode-textmate-languageservice/raw/95579fa/assets/compatibility-badge.svg" /></a> <a href="https://github.com/vsce-toolroom/vscode-textmate-languageservice/tree/v1.2.0/"><img src="https://img.shields.io/static/v1.svg?style=flat-square&label=Release%20Date&message=2023-03-29&logo=googlecalendar&logoColor=cacde2&labelColor=333333&color=2196f3" /></a> <a href="https://gitlab.com/SNDST00M/vscode-textmate-languageservice/-/milestones/6"><img src="https://img.shields.io/static/v1.svg?style=flat-square&label=Milestone&message=v1.2.0&logo=github&logoColor=cacde2&labelColor=333333&color=2196f3" /></a>

Hotfix for typo in documentation: `"textmate-language-contributes"` -> `"textmate-languageservice-contributes"`.

## 1.2.0

<a href="https://code.visualstudio.com/updates/v1_55" target="_blank"><img src="https://github.com/vsce-toolroom/vscode-textmate-languageservice/raw/95579fa/assets/compatibility-badge.svg" /></a> <a href="https://github.com/vsce-toolroom/vscode-textmate-languageservice/tree/v1.2.0/"><img src="https://img.shields.io/static/v1.svg?style=flat-square&label=Release%20Date&message=2023-03-29&logo=googlecalendar&logoColor=cacde2&labelColor=333333&color=2196f3" /></a> <a href="https://gitlab.com/SNDST00M/vscode-textmate-languageservice/-/milestones/5"><img src="https://img.shields.io/static/v1.svg?style=flat-square&label=Milestone&message=v1.2.0&logo=github&logoColor=cacde2&labelColor=333333&color=2196f3" /></a>

- Add support for creation of tokenization or light document service.
  - TL:DR; swap the `"contributes"` key with a 'fake' `"textmate-languageservice-contributes"` key in `package.json`.
  - Now possible to wire up a fake language and grammar "contribution" to a package service.
- Add service-only tests for TypeScript in the test suite.
- Use `TextmateLanguageService` as global key instead of `LSP` in service workers.
  - [`"LSP"`][wikipedia-languageserver-protocol] is an cross-process and IDE-agnostic message format/standard for language feature data.
  - This library's just a factory for language feature services in VS Code.
  - This change is not breaking thanks to Webpack.
- Improve diff generation for error logging in the sample output validator that's used to test feature providers.
- Add keywords to the NPM package's metadata for better search engine discovery.
- Skip web testing of `vscode.DefinitionProvider` and `vscode.WorkspaceSymbolProvider` factory methods.

## 1.1.0

<a href="https://code.visualstudio.com/updates/v1_55" target="_blank"><img src="https://github.com/vsce-toolroom/vscode-textmate-languageservice/raw/95579fa/assets/compatibility-badge.svg" /></a> <a href="https://github.com/vsce-toolroom/vscode-textmate-languageservice/tree/34d39b2/"><img src="https://img.shields.io/static/v1.svg?style=flat-square&label=Release%20Date&message=2023-02-24&logo=googlecalendar&logoColor=cacde2&labelColor=333333&color=2196f3" /></a> <a href="https://gitlab.com/SNDST00M/vscode-textmate-languageservice/-/milestones/4"><img src="https://img.shields.io/static/v1.svg?style=flat-square&label=Milestone&message=34d39b2&logo=github&logoColor=cacde2&labelColor=333333&color=2196f3" /></a>

- Bundle files using Webpack for performance boost.
- Add browser production support (bundle `onig.wasm` using `encoded-uint8array-loader` & prevent reliance on `fetch`).
- Restore typing declaration files for dependent extension consumers.
- Fix broken Gitlab pipeline so we have CI testing again.
- Fix line number collisions between entry symbols in the outline service.
- Fix container name in symbol information output for the document symbol provider.
- Upgrade `vscode-textmate` from **7.0.4** to **9.0.0** ([microsoft/vscode-textmate#198][github-microsoft-textmate-198]).
- Ignore test files from package before `npm publish` to reduce size by ~20%.
- Add a web-only test harness for testing compatibility with dependent web extensions.
- Add diff logging for JSON output sampling in the output sampler.
- Improve test suite performance by 20% by removing dependencies & bundling.

**NB:**
- I credited `vscode-matlab` contributors for writing some of the provider algorithms.
- Apologies and thanks for the support!

## 1.0.0

<a href="https://code.visualstudio.com/updates/v1_55" target="_blank"><img src="https://github.com/vsce-toolroom/vscode-textmate-languageservice/raw/95579fa/assets/compatibility-badge.svg" /></a> <a href="https://github.com/vsce-toolroom/vscode-textmate-languageservice/tree/34d39b2/"><img src="https://img.shields.io/static/v1.svg?style=flat-square&label=Release%20Date&message=2023-01-28&logo=googlecalendar&logoColor=cacde2&labelColor=333333&color=2196f3" /></a> <a href="https://gitlab.com/SNDST00M/vscode-textmate-languageservice/-/milestones/3"><img src="https://img.shields.io/static/v1.svg?style=flat-square&label=Milestone&message=v1.0.0&logo=github&logoColor=cacde2&labelColor=333333&color=2196f3" /></a>

- Achieved web readiness by handling hashing. We use native hashing of file text contents to keep it fast.
- Upgrade from SHA-1 algorithm (a famous collision-attack vector) and adopt stable SHA-256 alternatives.
- Remove last external dependency (`git-sha1`) so we don't need a bundler.

## 1.0.0-rc-2

<a href="https://code.visualstudio.com/updates/v1_55" target="_blank"><img src="https://github.com/vsce-toolroom/vscode-textmate-languageservice/raw/95579fa/assets/compatibility-badge.svg" /></a> <a href="https://github.com/vsce-toolroom/vscode-textmate-languageservice/tree/v1.0.0-rc-2/"><img src="https://img.shields.io/static/v1.svg?style=flat-square&label=Release%20Date&message=2023-01-27&logo=googlecalendar&logoColor=cacde2&labelColor=333333&color=2196f3" /></a> <a href="https://gitlab.com/SNDST00M/vscode-textmate-languageservice/-/milestones/2"><img src="https://img.shields.io/static/v1.svg?style=flat-square&label=Milestone&message=v1.0.0-rc-2&logo=github&logoColor=cacde2&labelColor=333333&color=2196f3" /></a>

- Fix the line number in the folding provider for top-level declaration folds after the first declaration.
- Add browser readiness with a cost-benefit tradeoff... we now load `onig.wasm` (Textmate grammar regex parser) [without streaming][github-monacotm-app-loadonigwasm].
- Remove any system dependencies in the test scripts. Plus the scripts use the CLIs better & are much cleaner.
- Convert [previous CI workflow][github-old-ci-yaml] pipeline format to Gitlab.

## 1.0.0-rc-1

<a href="https://code.visualstudio.com/updates/v1_55" target="_blank"><img src="https://github.com/vsce-toolroom/vscode-textmate-languageservice/raw/95579fa/assets/compatibility-badge.svg" /></a> <a href="https://github.com/vsce-toolroom/vscode-textmate-languageservice/tree/v1.0.0-rc-1/"><img src="https://img.shields.io/static/v1.svg?style=flat-square&label=Release%20Date&message=2023-01-26&logo=googlecalendar&logoColor=cacde2&labelColor=333333&color=2196f3" /></a> <a href="https://gitlab.com/SNDST00M/vscode-textmate-languageservice/-/milestones/1"><img src="https://img.shields.io/static/v1.svg?style=flat-square&label=Milestone&message=v1.0.0-rc-1&logo=github&logoColor=cacde2&labelColor=333333&color=2196f3" /></a>

- `vscode-textmate-languageservice` codebase republished and migrated to [Gitlab][gitlab-repository-tag-1.0.0.rc.1].
- Significant changes to the shape of the API exports.
  - Usage: `const lsp = new LSP('languageId', context)`
  - API is now a collection of async `create*` factory functions. The names match their output interfaces in the VS Code API.
  - This means you will need to use await or `.then` to get the actual provider class..
  - It also means your `activate` function is better off as an `async` function - the code will be easier to read.
  - Services/generators/engines are now all created behind the scenes to reduce boilerplate.
- Introduce top-level `"textmate-languageservices"` to support extension manifests with multiple configured languages.
  - This key can map language ID to config path, i.e. `"textmate-languageservices": { "lua": "./syntaxes/lua-textmate-configuration.json" }`.
  - (Without the setting, the package loads `./textmate-configuration.json` targeting the language ID in the `LSP` constructor.)
- Mostly removed Node dependencies in favour of native VS Code APIs. (Browser support SOON™?)
- Fix external file search matching in the definition provider, so it now searches in any folder.
- Invalidate service caches using an asynchronous hash engine - see #1.
- Rewrite folding provider to remove performance overheads in header & block folding - see #2.
- Fix line token incrementation for decremented lines in the tokenizer.
- Fix for cache hashing in Textmate engine tokenization queue.
- Add performance layer to Textmate scope selector parser to bypass the need for a WASM parser.

## 0.2.3

<a href="https://code.visualstudio.com/updates/v1_51" target="_blank"><img src="https://github.com/vsce-toolroom/vscode-textmate-languageservice/raw/34d39b2/assets/compatibility-badge.svg" /></a> <img src="https://img.shields.io/static/v1.svg?style=flat-square&label=Release%20Date&message=2022-04-01&logo=googlecalendar&logoColor=cacde2&labelColor=333333&color=2196f3" />

- Fix performance of header algorithm.
- Fix ending decrement of 1 line in folding provider top-level blocks.
- Add local test execution support to test suite.

## 0.2.2

<a href="https://code.visualstudio.com/updates/v1_51" target="_blank"><img src="https://github.com/vsce-toolroom/vscode-textmate-languageservice/raw/34d39b2/assets/compatibility-badge.svg" /></a> <img src="https://img.shields.io/static/v1.svg?style=flat-square&label=Release%20Date&message=2022-03-18&logo=googlecalendar&logoColor=cacde2&labelColor=333333&color=2196f3" />

- Fix performance of folding provider block dedent loop.
- Port Textmate scope parser to TypeScript and remove caching overheads.

## 0.2.1

<a href="https://code.visualstudio.com/updates/v1_51" target="_blank"><img src="https://github.com/vsce-toolroom/vscode-textmate-languageservice/raw/34d39b2/assets/compatibility-badge.svg" /></a> <img src="https://img.shields.io/static/v1.svg?style=flat-square&label=Release%20Date&message=2021-12-20&logo=googlecalendar&logoColor=cacde2&labelColor=333333&color=2196f3" />

Boost tokenization performance by adding cache layers to Textmate scope selector logic.

## 0.2.0

<a href="https://code.visualstudio.com/updates/v1_51" target="_blank"><img src="https://github.com/vsce-toolroom/vscode-textmate-languageservice/raw/34d39b2/assets/compatibility-badge.svg" /></a> <img src="https://img.shields.io/static/v1.svg?style=flat-square&label=Release%20Date&message=2021-12-02&logo=googlecalendar&logoColor=cacde2&labelColor=333333&color=2196f3" />

- Accept limited Textmate scope selectors in all configuration values.
- Introduce array-string duplicity to all configuration values.
- Add test suite for Textmate engine & VS Code providers.

Major breaking change - `meta.parens` does not match `meta.function-call.parens` in Textmate scope selectors.

## 0.1.1

<a href="https://code.visualstudio.com/updates/v1_51" target="_blank"><img src="https://github.com/vsce-toolroom/vscode-textmate-languageservice/raw/34d39b2/assets/compatibility-badge.svg" /></a> <img src="https://img.shields.io/static/v1.svg?style=flat-square&label=Release%20Date&message=2021-10-28&logo=googlecalendar&logoColor=cacde2&labelColor=333333&color=2196f3" />

Adds engine tokenization queue to improve performance for large files.

## 0.1.0

<a href="https://code.visualstudio.com/updates/v1_51" target="_blank"><img src="https://github.com/vsce-toolroom/vscode-textmate-languageservice/raw/34d39b2/assets/compatibility-badge.svg" /></a> <img src="https://img.shields.io/static/v1.svg?style=flat-square&label=Release%20Date&message=2021-08-27&logo=googlecalendar&logoColor=cacde2&labelColor=333333&color=2196f3" />

Initial version:

- Core Textmate engine generating data collection from Textmate token list.
- Includes five providers:
  - Document symbol provider
  - Folding provider
  - Peek definition provider
  - Table of Contents provider
  - Workspace symbol provider
- Configurable by `textmate-configuration.json`.
- Providers are exposed by a module index at [`./src/index.ts`][github-vsctmls-index].

## Roadmap

- `🚀` Adopt native `fetch` (Node 18.x) for loading WASM regexp parser for Oniguruma.
- `🚀` Investigate rolling PEG parser for Textmate scope selectors in WASM format.
- `✨` Semantic highlighting provider for parameters.
- `✨` Semantic highlighting provider for classes or other "Table of Contents" items.
- `✨` Semantic highlighting for variable assignment driven by token types and/or text.

<!-- 1.2.0 -->
[wikipedia-languageserver-protocol]: https://en.wikipedia.org/wiki/Language_Server_Protocol
<!-- 1.1.0 -->
[github-microsoft-textmate-198]: https://github.com/microsoft/vscode-textmate/issues/198
<!-- 1.0.5 -->
[github-monacotm-app-loadonigwasm]: https://github.com/bolinfest/monaco-tm/blob/908f1ca0cab3e82823cb465108ae86ee2b4ba3fc/src/app.ts#L141-L143
<!-- 1.0.0-rc-2 -->
[github-old-ci-yaml]: https://github.com/vsce-toolroom/vscode-textmate-languageservice/blob/v0.2.1/.github/workflows/ci.yml
<!-- 1.0.0-rc-1 -->
[gitlab-repository-tag-1.0.0.rc.1]: https://github.com/vsce-toolroom/vscode-textmate-languageservice/tags/v1.0.0-rc-1
<!-- 0.1.0 -->
[github-vsctmls-index]: https://github.com/vsce-toolroom/vscode-textmate-languageservice/blob/v0.1.0/src/index.ts

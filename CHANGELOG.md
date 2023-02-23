# Changelog

## 1.1.0-alpha.2

<a href="https://code.visualstudio.com/updates/v1_51" target="_blank"><img src="./assets/compatibility-badge.svg" /></a> <a href="https://gitlab.com/SNDST00M/vscode-textmate-languageservice/tree/v1.0.5/"><img src="https://img.shields.io/static/v1.svg?style=flat-square&label=Release%20Date&message=2023-01-29&logo=googlecalendar&logoColor=cacde2&labelColor=333333&color=2196f3" /></a> <a href="https://gitlab.com/SNDST00M/vscode-textmate-languageservice/-/milestones/4"><img src="https://img.shields.io/static/v1.svg?style=flat-square&label=Milestone&message=v1.0.3&logo=github&logoColor=cacde2&labelColor=333333&color=2196f3" /></a>

- Hotfix for browser support regression - [switch to `fetch`][github-monacotm-app-loadonigwasm] because `readFile` doesn't work for core dependencies.
- Add script to ignore test files from package before `npm publish` to reduce size by ~20% and commit noise.

## 1.0.0

<a href="https://code.visualstudio.com/updates/v1_51" target="_blank"><img src="./assets/compatibility-badge.svg" /></a> <a href="https://gitlab.com/SNDST00M/vscode-textmate-languageservice/tree/v1.1.0/"><img src="https://img.shields.io/static/v1.svg?style=flat-square&label=Release%20Date&message=2023-01-28&logo=googlecalendar&logoColor=cacde2&labelColor=333333&color=2196f3" /></a> <a href="https://gitlab.com/SNDST00M/vscode-textmate-languageservice/-/milestones/3"><img src="https://img.shields.io/static/v1.svg?style=flat-square&label=Milestone&message=v1.0.0&logo=github&logoColor=cacde2&labelColor=333333&color=2196f3" /></a>

- Achieved web readiness by handling hashing. We use native hashing of file text contents to keep it fast.
- Upgrade from SHA-1 algorithm (a famous collision-attack vector) and adopt stable SHA-256 alternatives.
- Remove last external dependency (`git-sha1`) so we don't need a bundler.

## 1.0.0-rc-2

<a href="https://code.visualstudio.com/updates/v1_51" target="_blank"><img src="./assets/compatibility-badge.svg" /></a> <a href="https://gitlab.com/SNDST00M/vscode-textmate-languageservice/tree/v1.0.0-rc-2/"><img src="https://img.shields.io/static/v1.svg?style=flat-square&label=Release%20Date&message=2023-01-27&logo=googlecalendar&logoColor=cacde2&labelColor=333333&color=2196f3" /></a> <a href="https://gitlab.com/SNDST00M/vscode-textmate-languageservice/-/milestones/2"><img src="https://img.shields.io/static/v1.svg?style=flat-square&label=Milestone&message=v1.0.0-rc-2&logo=github&logoColor=cacde2&labelColor=333333&color=2196f3" /></a>

- Fix the line number in the folding provider for top-level declaration folds after the first declaration.
- Add browser readiness with a cost-benefit tradeoff... we now load `onig.wasm` (Textmate grammar regex parser) [without streaming][github-monacotm-app-loadonigwasm].
- Remove any system dependencies in the test scripts. Plus the scripts use the CLIs better & are much cleaner.
- Convert [previous CI workflow][github-old-ci-yaml] pipeline format to Gitlab.

## 1.0.0-rc-1

<a href="https://code.visualstudio.com/updates/v1_51" target="_blank"><img src="./assets/compatibility-badge.svg" /></a> <a href="https://gitlab.com/SNDST00M/vscode-textmate-languageservice/tree/v1.0.0-rc-1/"><img src="https://img.shields.io/static/v1.svg?style=flat-square&label=Release%20Date&message=2023-01-26&logo=googlecalendar&logoColor=cacde2&labelColor=333333&color=2196f3" /></a> <a href="https://gitlab.com/SNDST00M/vscode-textmate-languageservice/-/milestones/1"><img src="https://img.shields.io/static/v1.svg?style=flat-square&label=Milestone&message=v1.0.0-rc-1&logo=github&logoColor=cacde2&labelColor=333333&color=2196f3" /></a>

- `vscode-textmate-languageservice` codebase republished and migrated to [Gitlab][gitlab-repository-tag-1.0.0.rc.1].
- Significant changes to the shape of the API exports.
  - Usage: `const lsp = new LSP('languageId', context)`
  - API is now a collection of async `create*` factory functions. The names match their output interfaces in the VS Code API.
  - This means you will need to use await or `.then` to get the actual provider class..
  - It also means your `activate` function is better off as an `async` function - the code will be easier to read.
  - Services/generators/engines are now all created behind the scenes to reduce boilerplate.
- Introduce top-level `"textmate-languageservices"` to support extension manifests with multiple configured languages.
  This key can map language ID to config path, i.e. `"textmate-languageservices": { "lua": "./syntaxes/lua-textmate-configuration.json" }`.
  (Without the setting, the package loads `./textmate-configuration.json` targeting the language ID in the `LSP` constructor.)
- Mostly removed Node dependencies in favour of native VS Code APIs. (Browser support SOON™?)
- Fix external file search matching in the definition provider, so it now searches in any folder.
- Invalidate service caches using an asynchronous hash engine - see #1.
- Rewrite folding provider to remove performance overheads in header & block folding - see #2.
- Fix line token incrementation for decremented lines in the tokenizer.
- Fix for cache hashing in Textmate engine tokenization queue.
- Add performance layer to Textmate scope selector parser to bypass the need for a WASM parser.

## 0.2.3

<a href="https://code.visualstudio.com/updates/v1_51" target="_blank"><img src="./assets/compatibility-badge.svg" /></a> <img src="https://img.shields.io/static/v1.svg?style=flat-square&label=Release%20Date&message=2022-04-01&logo=googlecalendar&logoColor=cacde2&labelColor=333333&color=2196f3" />

- Fix performance of header algorithm.
- Fix ending decrement of 1 line in folding provider top-level blocks.
- Add local test execution support to test suite.

## 0.2.2

<a href="https://code.visualstudio.com/updates/v1_51" target="_blank"><img src="./assets/compatibility-badge.svg" /></a> <img src="https://img.shields.io/static/v1.svg?style=flat-square&label=Release%20Date&message=2022-03-18&logo=googlecalendar&logoColor=cacde2&labelColor=333333&color=2196f3" />

- Fix performance of folding provider block dedent loop.
- Port Textmate scope parser to TypeScript and remove caching overheads.

## 0.2.1

<a href="https://code.visualstudio.com/updates/v1_51" target="_blank"><img src="./assets/compatibility-badge.svg" /></a> <img src="https://img.shields.io/static/v1.svg?style=flat-square&label=Release%20Date&message=2021-12-20&logo=googlecalendar&logoColor=cacde2&labelColor=333333&color=2196f3" />

Boost tokenization performance by adding cache layers to Textmate scope selector logic.

## 0.2.0

<a href="https://code.visualstudio.com/updates/v1_51" target="_blank"><img src="./assets/compatibility-badge.svg" /></a> <img src="https://img.shields.io/static/v1.svg?style=flat-square&label=Release%20Date&message=2021-12-02&logo=googlecalendar&logoColor=cacde2&labelColor=333333&color=2196f3" />

- Accept limited Textmate scope selectors in all configuration values.
- Introduce array-string duplicity to all configuration values.
- Add test suite for Textmate engine & VS Code providers.

Major breaking change - `meta.parens` does not match `meta.function-call.parens` in Textmate scope selectors.

## 0.1.1

<a href="https://code.visualstudio.com/updates/v1_51" target="_blank"><img src="./assets/compatibility-badge.svg" /></a> <img src="https://img.shields.io/static/v1.svg?style=flat-square&label=Release%20Date&message=2021-10-28&logo=googlecalendar&logoColor=cacde2&labelColor=333333&color=2196f3" />

Adds engine tokenization queue to improve performance for large files.

## 0.1.0

<a href="https://code.visualstudio.com/updates/v1_51" target="_blank"><img src="./assets/compatibility-badge.svg" /></a> <img src="https://img.shields.io/static/v1.svg?style=flat-square&label=Release%20Date&message=2021-08-27&logo=googlecalendar&logoColor=cacde2&labelColor=333333&color=2196f3" />

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

- Browser support for Oniguruma and file system dependencies.
- Semantic highlighting provider for parameters.
- Semantic highlighting provider for classes or other "Table of Contents" items.
- Semantic highlighting for variable assignment driven by token types and/or text.
- Custom entry text/type getter for "Table of Contents" provider.

<!-- 1.0.5 -->
[github-monacotm-app-loadonigwasm]: https://github.com/bolinfest/monaco-tm/blob/908f1ca0cab3e82823cb465108ae86ee2b4ba3fc/src/app.ts#L141-L143
<!-- 1.0.0-rc-2 -->
[github-old-ci-yaml]: https://gitlab.com/SNDST00M/vscode-textmate-languageservice/-/blob/v0.2.1/.github/workflows/ci.yml
<!-- 1.0.0-rc-1 -->
[gitlab-repository-tag-1.0.0.rc.1]: https://gitlab.com/SNDST00M/vscode-textmate-languageservice/-/tags/v1.0.0-rc-1
<!-- 0.1.0 -->
[github-vsctmls-index]: https://gitlab.com/SNDST00M/vscode-textmate-languageservice/-/blob/v0.1.0/src/index.ts

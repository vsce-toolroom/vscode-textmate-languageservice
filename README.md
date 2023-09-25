# `vscode-textmate-languageservice`

<p align="center"><img src="https://raw.githubusercontent.com/vsce-toolroom/vscode-textmate-languageservice/v2.0.0-recovery.1/assets/logo.png" width="205px" /></p>

> 🎉 **This package has been adopted by the `vsce-toolroom` GitHub collective.**

> *This package is in maintenance mode & the Textmate technology is superseded by `vscode-anycode`, a quicker language service which leverages the [`tree-sitter` symbolic-expression parser technology][tree-sitter-parser-guide].*

Language service providers & APIs driven entirely by your Textmate grammar and one configuration file.

<p align="center"><img src="https://github.com/vsce-toolroom/vscode-textmate-languageservice/raw/v2.0.0-recovery.1/assets/demo-outline.png" height="320"/></p>

In order to generate language providers from this module, the Textmate grammar must include the following features:

- meta declaration scopes for block level declarations
- variable assignment scopes differentiated between `multiple` and `single`
- granular keyword control tokens with `begin` and `end` scopes

## Installation

```
npm install vscode-textmate-languageservice
```

Browser support:

- This package supports Webpack and ESBuild.
- If you use a bundler, you need to set `crypto` as a external (`commonjs crypto` one in webpack).
  This allows the library to avoid polyfilling the `node:crypto` module.

**Advisory:**

> This package is stable with browser compatibility (`1.1.0`). But I recommend you watch out for `tree-sitter` [native integration][github-vscode-pull-treesitter] into `vscode` ([issue][github-vscode-issue-treesitter]). Maintainable & with faster retokenization, **it is a Holy Grail** ...

> Whereas this package depends on a [well-written Textmate grammar][macromates-scope-selector-spec] and is a band aid of sorts.

> If there is [native `vscode` support for the language][vscode-known-language-ids], find a Tree-sitter syntax online then suggest it in an [Anycode issue][github-vscode-anycode-issues].
> Otherwise, please open an issue on the [community-maintained Treesitter syntax highlighter extension][github-epeshkov-syntax-highlighter] and someone might deal with it.

## Setup

- [Language contribution][vscode-language-contributions] and [grammar contribution][vscode-grammar-contributions] defined via `contributes` in the [extension manifest][vscode-extension-manifest] (or `textmate-languageservice-contributes`).
- Your grammar is bundled in the extension source code and is consumable by `vscode-textmate` (which can load PList XML, JSON or YAML grammars).
- A configuration file is available in the extension, defaulting to `./textmate-configuration.json`. You can also use `textmate-languageservices` property of `package.json` to map language ID to relative path.

Example language extension manifest - `./package.json`:

```json
{
	"name": "lua",
	"displayName": "Textmate language service for Lua",
	"description": "Lua enhanced support for Visual Studio Code",
	"version": "0.0.1",
	"publisher": "",
	"license": "",
	"engines": {
		"vscode": "^1.51.1"
	},
	"categories": [
		"Programming Languages"
	],
	"contributes": {
		"languages": [{
			"id": "lua",
			"aliases": ["Lua"],
			"extensions": [".lua", ".moon", ".luau"],
			"configuration": "./language-configuration.json"
		}],
		"grammars": [{
			"language": "lua",
			"scopeName": "source.lua",
			"path": "./syntaxes/Lua.tmLanguage.json"
		}]
	}
}
```

## Configuration

Create a JSON file named `textmate-configuration.json` in the extension directory. The file accepts comments and trailing commas.

If you only want to use the document and/or tokenization services, this file can be as simple as `{}`.

Textmate configuration fields:

- **`assignment`** - optional (`object`)<br/>
  Collection of Textmate scope selectors for variable assignment scopes when including variable symbols:<br/>
  **Properties:**
  - `separator`: Token to separate multiple assignments (`string`)
  - `single`: Token to match single variable assignment. (`string`)
  - `multiple`: Token to match multiple variable assignment. (`string`)
- **`declarations`** - optional (`array`)<br/>
  List of Textmate scope selectors for declaration token scopes.
- **`dedentation`** - optional (`array`)<br/>
  List of Textmate tokens for dedented code block declarations (e.g. `ELSE`, `ELSEIF`).<br/>
  Tokens still need to be listed in `indentation` with the decrementing value `-1`.
- **`exclude`** (`string`)
  VS Code glob pattern for files to exclude from workspace symbol search.
- **`indentation`** - optional (`object`)<br/>
  Indentation level offset for Textmate token types (used to implement folding).
- **`punctuation`** - optional (`object`)<br/>
  Collection of punctuation tokens with a significant effect on syntax providers.
  **Properties:**
  - `continuation`: Token scope selector for line continuation (to use in region matching). (`string`)
- **`markers`** - optional (`object`)<br/>
  Stringified regular expression patterns for folding region comments.
  - `start`: Escaped regular expression for start region marker. (`string`)
  - `end`: Escaped regular expression for end region marker. (`string`)
  **Properties:**
- **`symbols`** - optional (`object`)<br/>
  Map of document symbol tokens to their symbol kind ([`vscode.SymbolKind`][vscode-api-symbolkind] value).

### Configuration examples

Template for `textmate-configuration.json` file:

```json
{
  "assignment": {
    "single": "",
    "multiple": "",
    "separator": ""
  },
  "declarations": [],
  "dedentation": [
    "keyword.control.elseif.custom",
    "keyword.control.else.custom"
  ],
  "exclude": "{.modules,.includes}/**",
  "indentation": {
    "punctuation.definition.comment.begin.custom": 1,
    "punctuation.definition.comment.end.custom": -1,
    "keyword.control.begin.custom": 1,
    "keyword.control.end.custom": -1
  },
  "punctuation": {
    "continuation": "punctuation.separator.continuation.line.custom"
  },
  "markers": {
    "start": "^\\s*#?region\\b",
    "end": "^\\s*#?end\\s?region\\b"
  },
  "symbols": {
    "keyword.control.custom": 2,
    "entity.name.function.custom": 11
  }
}
```

An example configuration file that targets Lua:

```json
{
  "assignment": {
    "single": "meta.assignment.variable.single.lua",
    "multiple": "meta.assignment.variable.group.lua",
    "separator": "punctuation.separator.comma.lua"
  },
  "declarations": [
    "meta.declaration.lua entity.name",
    "meta.assignment.definition.lua entity.name"
  ],
  "dedentation": [
    "keyword.control.elseif.lua",
    "keyword.control.else.lua"
  ],
  "exclude": "{.luarocks,lua_modules}/**",
  "indentation": {
    "punctuation.definition.comment.begin.lua": 1,
    "punctuation.definition.comment.end.lua": -1,
    "keyword.control.begin.lua": 1,
    "keyword.control.end.lua": -1
  },
  "markers": {
    "start": "^\\s*#?region\\b",
    "end": "^\\s*#?end\\s?region\\b"
  },
  "symbols": {
    "keyword.control.lua": 2,
    "entity.name.function.lua": 11
  }
}
```

## Usage

### Language extension

Extension code sample - `./src/extension.ts`:

```typescript
import TextmateLanguageService from 'vscode-textmate-languageservice';

export async function activate(context: vscode.ExtensionContext) {
	const selector: vscode.DocumentSelector = 'lua';
	const textmateService = new TextmateLanguageService(selector, context);

	const foldingRangeProvider = await textmateService.createFoldingRangeProvider();
	const documentSymbolProvider = await textmateService.createDocumentSymbolProvider();
	const workspaceSymbolProvider = await textmateService.createWorkspaceSymbolProvider();
	const definitionProvider = await textmateService.createDefinitionProvider();

	context.subscriptions.push(vscode.languages.registerDocumentSymbolProvider(selector, documentSymbolProvider));
	context.subscriptions.push(vscode.languages.registerFoldingRangeProvider(selector, foldingRangeProvider));
	context.subscriptions.push(vscode.languages.registerWorkspaceSymbolProvider(workspaceSymbolProvider));
	context.subscriptions.push(vscode.languages.registerDefinitionProvider(selector, peekDefinitionProvider));
};
```

### Tokenization

Extension code sample - `./src/extension.ts`:

```typescript
import TextmateLanguageService from 'vscode-textmate-languageservice';

export async function activate(context: vscode.ExtensionContext) {
    const selector: vscode.DocumentSelector = 'custom';
    const textmateService = new TextmateLanguageService('custom', context);
    const textmateTokenService = await textmateService.initTokenService();
    const textDocument = vscode.window.activeTextEditor!.document;
    const tokens = textmateTokenService.fetch(textDocument);
};
```

**NB:** If you would like to:

- just wire up tokenization or fast document text services to a Textmate grammar,
- without [(re-)contributing grammar and language configuration to VS Code](#setup),
- or writing a full [`TextmateLanguageService` provider configuration](#configuration)..

You can use the custom `"textmate-languageservice-contributes"` property in `package.json`:

```json
{
	"textmate-languageservice-contributes": {
		"languages": [{
			"id": "typescript",
			"aliases": ["TypeScript"],
			"extensions": [".ts", ".tsx", ".cts", ".mts"]
		}],
		"grammars": [{
			"language": "typescript",
			"scopeName": "source.ts",
			"path": "./syntaxes/TypeScript.tmLanguage.json"
		}]
	}
}
```

### API methods

Usage (example is for getting the token at the current cursor position):

```typescript
const { getScopeInformationAtPosition } = TextmateLanguageService.api;

const editor = vscode.window.activeTextEditor;
const document = editor.document;
const position = editor.selection.active;

const token = await getScopeInformationAtPosition(document, position);
```

#### `getScopeInformationAtPosition`

`getScopeInformationAtPosition(document: LiteTextDocument, position: vscode.Position): Promise<TextmateToken>`

Get token scope information at a specific position (caret line and character number).

- **Parameter:** *document* - Document to be tokenized (`LiteTextDocument`).
- **Parameter:** *position* - Zero-indexed caret position of token in document (`vscode.Position`).
- **Returns:** Promise resolving to token data for scope selected by caret position (`{Promise<TextmateToken>}`).

#### `getScopeRangeAtPosition`

`getScopeRangeAtPosition(document: LiteTextDocument, position: vscode.Position): vscode.Range;`

Get matching scope range of the Textmate token intersecting a caret position.

- **Parameter:** *document* - Document to be tokenized (`LiteTextDocument`).
- **Parameter:** *position* - Zero-indexed caret position to intersect with (`vscode.Position`).
- **Returns:** Promise resolving to character and line number of the range (`Promise<vscode.Range>`).

#### `getTokenInformationAtPosition`

`getTokenInformationAtPosition(document: LiteTextDocument, position: vscode.Position): Promise<vscode.TokenInformation>;`

VS Code compatible performant API for token information at a caret position.

- **Parameter:** *document* - Document to be tokenized (`LiteTextDocument`).
- **Parameter:** *position* - Zero-indexed caret position of token in document (`vscode.Position`).
- **Returns:** Promise resolving to token data compatible with VS Code (`Promise<vscode.TokenInformation>`).

#### `getLanguageConfiguration`

`getLanguageConfiguration(languageId: string): LanguageDefinition;`

Get the active language point configuration of a language mode identifier.

- **Parameter:** *languageId* - Language ID as shown in brackets in "Change Language Mode" panel (`string`).
- **Returns:** Language contribution as configured in source VS Code extension (`LanguageDefinition`).

#### `getGrammarConfiguration`

`getGrammarConfiguration(languageId: string): GrammarLanguageDefinition;`

Get the active language point configuration of a language mode identifier.

- **Parameter:** *languageId* - Language identifier, shown in brackets in "Change Language Mode" panel (`string`).
- **Returns:** Grammar contribution as configured in source VS Code extension (`GrammarLanguageDefinition`).

#### `getContributorExtension`

`getContributorExtension(languageId: string): vscode.Extension<unknown> | void;`

Get the VS Code Extension API entry of the extension that contributed a language mode identifier.

- **Parameter:** *languageId* - Language identifier, shown in brackets in "Change Language Mode" panel (`string`).
- **Returns:** Extension API instance that contributed the language - (`vscode.Extension`).

### Use Oniguruma WASM buffer

This is the `vscode-oniguruma` build of Oniguruma written in C, compiled to WASM format with memory hooks to V8.

This is not streaming 🙁 but `vscode` libs must bundle WebAssembly deps so as to support web ecosystem.

```typescript
import TextmateLanguageService from 'vscode-textmate-languageservice';
const onigurumaPromise = TextmateLanguageService.utils.getOniguruma();
```

<!-- `vscode-textmate-languageservice` -->
[tree-sitter-parser-guide]: https://tree-sitter.github.io/tree-sitter/using-parsers#pattern-matching-with-queries
[github-vscode-pull-treesitter]: https://github.com/microsoft/vscode/pull/161479
[github-vscode-issue-treesitter]: https://github.com/microsoft/vscode/issues/50140
[macromates-scope-selector-spec]: https://macromates.com/manual/en/language_grammars#naming_conventions
[vscode-known-language-ids]: https://code.visualstudio.com/docs/languages/identifiers#_known-language-identifiers
[github-vscode-anycode-issues]: https://github.com/microsoft/vscode-anycode/issues
[github-epeshkov-syntax-highlighter]: https://github.com/EvgeniyPeshkov/syntax-highlighter
<!-- Setup -->
[vscode-extension-manifest]: https://code.visualstudio.com/api/references/extension-manifest
[vscode-language-contributions]: https://code.visualstudio.com/api/references/contribution-points#contributes.languages
[vscode-grammar-contributions]: https://code.visualstudio.com/api/references/contribution-points#contributes.grammars
<!-- Configuration -->
[vscode-api-symbolkind]: https://code.visualstudio.com/api/references/vscode-api#SymbolKind

# `vscode-typescript-textmate`

This is a sample extension demonstrating how the [`vscode-textmate-languageservice`](../../../README.md) library supports built-in languages.

```json
{
	"textmate-languageservice-contributes": {
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

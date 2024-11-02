# `vscode-vue`

This is a sample extension demonstrating how to wire a grammar and language configuration to the [`vscode-textmate-languageservice`](../../../README.md) library using `contributes`:

```json
{
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

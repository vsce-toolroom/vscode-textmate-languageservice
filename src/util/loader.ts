'use strict';

import * as vscode from 'vscode';
import type { JsonValue } from 'type-fest';

const decoder = new TextDecoder('utf-8');
const jsonCommentsRegex = /\/\*[\s\S]*?\*\/|\/\/.*/g;

export async function readFileBytes(uri: vscode.Uri) {
	// Other libraries such as monaco-tm use `fetch` and pipe a response.
	// This allows them to use a streaming compiler for WASM.
	// However these browser APIs require us to aggressively complicate
	// compiler stack or lock support to 1 env (browser or Node).
	// The perf payoff is most likely not worth it.
	return vscode.workspace.fs.readFile(uri);
}

export async function readFileText(uri: vscode.Uri): Promise<string> {
	// We assume that the document language is in UTF-8
	try {
		return decoder.decode(await readFileBytes(uri));
	} catch (e) {
		throw e;
	}
}

export async function loadJsonFile<T = JsonValue>(uri: vscode.Uri): Promise<T> {
	try {
		let text = await readFileText(uri);
		text = text.replace(jsonCommentsRegex, ''); // support jsonc!
		return JSON.parse(text) as T;
	} catch (e) {
		if (e instanceof SyntaxError && e.hasOwnProperty('stack')) {
			e.stack += `\n    in ${uri.path}`;
		}
		throw e;
	}
}

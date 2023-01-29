'use strict';

import * as vscode from 'vscode';
import type { JsonValue } from 'type-fest';

const decoder = new TextDecoder('utf-8');
const jsonCommentsRegex = /\/\*[\s\S]*?\*\/|\/\/.*/g;

export async function readFileText(uri: vscode.Uri): Promise<string> {
	// We assume that the document language is in UTF-8
	try {
		return decoder.decode(await vscode.workspace.fs.readFile(uri));
	} catch (e) {
		throw e;
	}
}

export async function getWasmFile(filepath: string): Promise<Uint8Array | Response> {
	// Node environment.
	if (globalThis.process?.env?.node) {
		const uri = vscode.Uri.file(filepath);
		return vscode.workspace.fs.readFile(uri);
	}
	// Web environment.
	//  Handle non-WASM blob with non-streaming compiler :[
	//  In VS Code environment we have problem where the response buffer is `<` instead of `asm`.
	//  This is slower to compile and not great but it always works.
	//  https://github.com/bolinfest/monaco-tm/blob/908f1c/src/app.ts#L135-L144
	const response = await fetch(filepath);
	if (!response.ok) {
		throw new TypeError(`GET ${filepath} ${response.status || ''}`.trim());
	}
	return response;
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

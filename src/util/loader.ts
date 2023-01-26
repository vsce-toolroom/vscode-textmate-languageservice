'use strict';

import * as vscode from 'vscode';
import { isNode } from 'browser-or-node';
import type { JsonValue } from 'type-fest';

async function fetchAsBuffer(uri: vscode.Uri): Promise<Uint8Array> {
	const response = await fetch(uri.toString());
	if (!response.ok) {
		throw new Error(`GET ${uri.toString()} ${response.status}`);
	}
	const buffer = await response.arrayBuffer();
	return new Uint8Array(buffer);
}

export async function readFileBytes(uri: vscode.Uri) {
	return !isNode ? await fetchAsBuffer(uri) : await vscode.workspace.fs.readFile(uri);
}

export async function readFileText(uri: vscode.Uri): Promise<string> {
	// We assume that the document language is in UTF-8
	const decoder = new TextDecoder('utf-8');
	try {
		return decoder.decode(await readFileBytes(uri));
	} catch (e) {
		throw e;
	}
}

const jsonCommentsRegex = /\/\*[\s\S]*?\*\/|\/\/.*/g;

export async function loadJsonFile<T = JsonValue>(uri: vscode.Uri): Promise<T> {
	try {
		let text = await readFileText(uri);
		text = text.replace(jsonCommentsRegex, '');
		return JSON.parse(text) as T;
	} catch (e) {
		if (e instanceof SyntaxError && e.hasOwnProperty('stack')) {
			e.stack += `\n    in ${uri.path}`;
		}
		throw e;
	}
}

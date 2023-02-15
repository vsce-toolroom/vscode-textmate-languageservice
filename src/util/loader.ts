'use strict';

import * as vscode from 'vscode';
import type { JsonValue, PartialDeep } from 'type-fest';

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

type PartialJsonValue = PartialDeep<JsonValue>;

export async function loadJsonFile<T = PartialJsonValue>(uri: vscode.Uri): Promise<T> {
	try {
		let text = await readFileText(uri);
		text = text.replace(jsonCommentsRegex, ''); // support jsonc!
		return JSON.parse(text) as T;
	} catch (e) {
		if (e && typeof (e as Error).stack === 'string') {
			(e as Error).stack += `\n    in ${uri.path}`;
		}
		throw e;
	}
}

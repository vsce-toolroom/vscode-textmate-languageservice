'use strict';

import * as vscode from 'vscode';
import type { JsonValue, PartialDeep } from 'type-fest';

// We assume that the document language is in UTF-8.
const decoder = new TextDecoder('utf-8');

export async function readFileText(uri: vscode.Uri): Promise<string> {
	try {
		return decoder.decode(await vscode.workspace.fs.readFile(uri));
	} catch (e) {
		throw e as TypeError | vscode.FileSystemError;
	}
}

type PartialJsonValue = PartialDeep<JsonValue>;

export async function loadJsonFile<T = PartialJsonValue>(uri: vscode.Uri): Promise<T> {
	try {
		const text = await readFileText(uri);
		return JSON.parse(text) as T;
	} catch (e) {
		if (e && typeof (e as Error).stack === 'string') {
			(e as Error).stack += `\n    in ${uri.path}`;
		}
		throw e;
	}
}

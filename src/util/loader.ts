'use strict';

import * as vscode from 'vscode';
import JSONC from 'tiny-jsonc';
import * as i18n from '../i18n.json';
import type { JsonValue, PartialDeep } from 'type-fest';

// We assume that the document language is in UTF-8.
const decoder = new TextDecoder('utf-8');

export async function readFileText(uri: vscode.Uri): Promise<string> {
	try {
		return decoder.decode(await vscode.workspace.fs.readFile(uri));
	} catch (e) {
		throw e;
	}
};

type PartialJsonValue = PartialDeep<JsonValue>;

export async function loadJsonFile<T = PartialJsonValue>(uri: vscode.Uri, fallback?: string): Promise<T> {
	try {
		const text = await readFileText(uri);
		return JSONC.parse(text) as T;
	} catch (e) {
		if (fallback) {
			return JSONC.parse(fallback) as T;
		}

		if (e && typeof (e as Error).stack === 'string') {
			(e as Error).stack += `\n    in ${uri.path}`;
		}

		throw e;
	}
};

export function loadMessageBundle() {
	return function(key: string, message: string): string {
		const locale = vscode.env.language;
		const base = locale.split('-')[0];
		return (i18n[locale] || i18n[base] || {})[key] || message;
	};
};

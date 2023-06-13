'use strict';

import * as vscode from 'vscode';

import TextmateLanguageService from '../../src/main';

import type { JsonValue, PartialDeep } from 'type-fest';

const encoder = new TextEncoder();

export type PartialJsonValue = PartialDeep<JsonValue>;

export function getTestModeExtension(): vscode.Extension<void> {
	return vscode.extensions.all[vscode.extensions.all.length - 1];
}

export async function writeJsonFile(uri: vscode.Uri, json: PartialJsonValue): Promise<void> {
	try {
		const text = JSON.stringify(json, null, 2) + '\n';
		const bytes = encoder.encode(text);
		await vscode.workspace.fs.writeFile(uri, bytes);
	} catch (e) {
		if (e && typeof (e as Error).stack === 'string') {
			(e as Error).stack += `\n    in ${uri.path}`;
		}
		throw e;
	}
}

/** `loadJsonFile` utility. */
export const loadJsonFile = TextmateLanguageService.utils.loadJsonFile;

/** `TextmateScopeSelectorMap` utility. */
export const ResolverService = TextmateLanguageService.utils.ResolverService;

/** `TextmateScopeSelector` utility. */
export const TextmateScopeSelector = TextmateLanguageService.utils.TextmateScopeSelector;

/** `TextmateScopeSelectorMap` utility. */
export const TextmateScopeSelectorMap = TextmateLanguageService.utils.TextmateScopeSelectorMap;

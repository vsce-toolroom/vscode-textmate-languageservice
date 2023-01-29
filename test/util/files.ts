'use strict';

import * as fs from 'fs';
import * as vscode from 'vscode';
import type { JsonValue } from 'type-fest';

import context from './context';

export async function writeJsonFile(uri: vscode.Uri, json: JsonValue): Promise<void> {
	try {
		const text = JSON.stringify(json, null, 2) + '\n';
		await fs.promises.writeFile(uri.fsPath, text);
	} catch (e) {
		if (e instanceof TypeError && e.hasOwnProperty('stack')) {
			e.stack += `\n    in ${uri.path}`;
		}
		throw e;
	}
}

export const SUBMODULE_NAME = 'vscode-matlab';

export const BASE_CLASS_NAME = 'Animal';

export const SAMPLE_FILE_BASENAMES = ['Animal', 'Cat', 'Dog', 'Horse', 'Snake'];

export const TEST_COMPONENT_BASENAMES = [
	'selectors.util',
	'tokenizer.service',
	'outline.service',
	'document.service',
	'folding',
	'document-symbol',
	'workspace-symbol',
	'definition'
];

export const SELECTOR_TEST_DATA_BASENAME = 'selector';
export const SELECTOR_MAP_TEST_DATA_BASENAME = 'map';

export const WORKSPACE_SYMBOL_TEST_DATA_BASENAME = 'index';

/** @param basename Basename of test file - `out\test\suite\*.test.js`. */
export function getComponentFileFsPath(basename: string): string {
	return `../../out/test/suite/${basename}.test.js`.replace(/\//g, '\\');
}

/** @param basename Basename of sample file - `test\samples\*.m`. */
export function getSampleFileUri(basename: string): vscode.Uri {
	return vscode.Uri.joinPath(context.extensionUri, `./samples/${basename}.m`);
}

/**
 * @param component Name of callee test component - `test\suite\*.test.js`.
 * @param sample Basename of data file - `data\*\*\*.json`.
 * */
export function geComponentDataUri(component: string, sample: string): vscode.Uri {
	return vscode.Uri.joinPath(context.extensionUri, `./data/${component}/${sample}.json`);
}

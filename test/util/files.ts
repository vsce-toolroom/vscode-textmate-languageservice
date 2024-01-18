'use strict';

import * as vscode from 'vscode';

import { getTestModeExtension } from './common';

export const LANGUAGES = ['matlab', 'typescript', 'mediawiki'];

export const EXTENSIONS = ['.m', '.ts', '.wiki'];

export const BASENAMES = {
	matlab: ['Animal', 'Cat', 'Dog', 'Horse', 'Snake'],
	mediawiki: ['List'],
	typescript: ['Pet']
};

/**
 * @param {string} basename Basename of sample file - `test\samples\*.m`.
 */
export function getSampleFileUri(basename: string): vscode.Uri {
	const ext = EXTENSIONS[LANGUAGES.indexOf(globalThis.languageId)];
	return vscode.Uri.joinPath(getTestModeExtension().extensionUri, `./samples/${basename}${ext}`);
}

/**
 * @param {string} component Name of callee test object component - `src\*.js`.
 * @param {string} sample Basename of target sample file - `data\*\*\*.json`.
 * */
export function getComponentSampleDataUri(component: string, sample: string): vscode.Uri {
	return vscode.Uri.joinPath(getTestModeExtension().extensionUri, `./data/${component}/${sample}.json`);
}

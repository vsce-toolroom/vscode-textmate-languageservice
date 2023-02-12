'use strict';

import * as vscode from 'vscode';
import type { JsonValue } from 'type-fest';

const encoder = new TextEncoder();

export async function writeJsonFile(uri: vscode.Uri, json: JsonValue): Promise<void> {
	try {
		const text = JSON.stringify(json, null, 2) + '\n';
		const bytes = encoder.encode(text);
		await vscode.workspace.fs.writeFile(uri, bytes);
	} catch (e) {
		if (e && typeof e.stack === 'string') {
			e.stack += `\n    in ${uri.path}`;
		}
		throw e;
	}
}

export const SUBMODULE_NAME = 'vscode-matlab';

export const BASE_CLASS_NAME = 'Animal';

export const SAMPLE_FILE_BASENAMES = ['Animal', 'Cat', 'Dog', 'Horse', 'Snake'];

/** @param basename Basename of sample file - `test\samples\*.m`. */
export function getSampleFileUri(this: vscode.ExtensionContext, basename: string): vscode.Uri {
	return vscode.Uri.joinPath(this.extensionUri, `./samples/${basename}.m`);
}

/**
 * @param component Name of callee test object component - `src\*.js`.
 * @param sample Basename of target sample file - `data\*\*\*.json`.
 * */
export function getComponentSampleDataUri(this: vscode.ExtensionContext, component: string, sample: string): vscode.Uri {
	return vscode.Uri.joinPath(this.extensionUri, `./data/${component}/${sample}.json`);
}

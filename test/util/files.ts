'use strict';

import * as vscode from 'vscode';
import type { JsonValue, PartialDeep } from 'type-fest';

const encoder = new TextEncoder();

type PartialJsonValue = PartialDeep<JsonValue>;

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

export const BASE_CLASS_NAME = 'Animal';

export const SERVICE_SAMPLE_BASENAME = 'Pet';

export const SAMPLE_FILE_BASENAMES = ['Animal', 'Cat', 'Dog', 'Horse', 'Snake'];

/**
 * @this {vscode.ExtensionContext} Submodule extension context.
 * @param {string} basename Basename of sample file - `test\samples\*.m`.
*/
export function getSampleFileUri(this: vscode.ExtensionContext, basename: string): vscode.Uri {
	const ext = basename === SERVICE_SAMPLE_BASENAME ? '.ts' : '.m';
	return vscode.Uri.joinPath(this.extensionUri, `./samples/${basename}${ext}`);
}

/**
 * @this {vscode.ExtensionContext} Submodule extension context.
 * @param {string} component Name of callee test object component - `src\*.js`.
 * @param {string} sample Basename of target sample file - `data\*\*\*.json`.
 * */
export function getComponentSampleDataUri(this: vscode.ExtensionContext, component: string, sample: string): vscode.Uri {
	return vscode.Uri.joinPath(this.extensionUri, `./data/${component}/${sample}.json`);
}

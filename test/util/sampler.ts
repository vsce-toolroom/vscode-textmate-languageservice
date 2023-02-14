'use strict';

import * as vscode from 'vscode';
import * as assert from 'assert';

import { loadJsonFile } from './factory';
import { writeJsonFile, getComponentSampleDataUri } from './files';
import { jsonify } from './jsonify';

const isWeb = vscode.env.uiKind === vscode.UIKind.Web;
const isRemote = typeof vscode.env.remoteName === 'string';

export async function sampler(this: vscode.ExtensionContext, component: string, basename: string, output: any[]) {
	const data = getComponentSampleDataUri.call(this, component, basename) as vscode.Uri;
	let stat: vscode.FileStat | void;

	// Check if file exists.
	try {
		stat = await vscode.workspace.fs.stat(data);
	// eslint-disable-next-line no-empty
	} finally {}

	// Run JSON diff assert.
	let error: assert.AssertionError | undefined;
	try {
		if (stat) {
			assert.deepEqual(jsonify(output), await loadJsonFile(data), `./test/data/${component}/${basename}.json`);
		}
	} catch(e) {
		error = e as assert.AssertionError;

	}
	if (error) {
		// In web runtime, dump output to terminal console (web runtime).
		if (isWeb && !isRemote) {
			console.log(`\n${JSON.stringify(output)}\n`);
		}
		// In Node runtime, dump output to data component subdirectory ().
		if (!isWeb || isRemote) {
			await writeJsonFile(data, output);
		}
		throw error;
	}
}

'use strict';

import * as vscode from 'vscode';
import * as fastDeepEqual from 'fast-deep-equal';

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
	} catch (_) {}

	// Run JSON diff assert.
	if (stat && !fastDeepEqual(jsonify(output), await loadJsonFile(data))) {
		// In Node runtime, dump output to data component subdirectory.
		if (!isWeb || isRemote) {
			await writeJsonFile(data, output);
		}
		// In web runtime, dump output to terminal console (web runtime).
		if (isWeb && !isRemote) {
			console.log(`\n${JSON.stringify(output)}\n`);
		}
		throw new TypeError(`./test/data/${component}/${basename}.json`);
	}
}

'use strict';

import * as vscode from 'vscode';
import * as assert from 'assert';

import { loadJsonFile } from './factory';
import { writeJsonFile, getComponentSampleDataUri } from './files';
import { jsonify } from './jsonify';

export async function sampler(this: vscode.ExtensionContext, component: string, basename: string, output: any[]) {
	const data = getComponentSampleDataUri.call(this, component, basename);
	let stat: vscode.FileStat | void;

	// Check if file exists.
	try { stat = await vscode.workspace.fs.stat(data); } finally {}

	// Run JSON diff assert.
	test(`./test/data/${component}/${basename}.json`, async function() {
		let error: TypeError | undefined;
		try {
			if (stat) {
				assert.deepEqual(jsonify(output), await loadJsonFile(data));
			}
		} catch(e) {
			error = e;

		// Dump output to subdirectory for data component.
		} finally {
			await writeJsonFile(data, output);
		}
		if (error) throw error;
	});
}

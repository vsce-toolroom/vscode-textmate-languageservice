'use strict';

import * as vscode from 'vscode';
import * as assert from 'assert';
import deepEqual = require('deep-equal');
import type { JsonValue } from 'type-fest';

import { loadJsonFile } from '../../src/util/loader';

import { writeJsonFile, geComponentDataUri } from './files';

export default async function(component: string, basename: string, output: JsonValue) {
	const data = geComponentDataUri(component, basename.replace(/\.m$/, ''));
	let path: string | void;

	// Check if file exists.
	try {
		await vscode.workspace.fs.stat(data);
		path = data.toString();
	} finally {}

	// Run JSON diff assert.
	let error: assert.AssertionError;
	try {
		if (path) {
			assert.strictEqual(deepEqual(output, await loadJsonFile(data)), true, path);
		}
	} catch(e) {
		error = e;

	// Dump output to subdirectory for data component.
	} finally {
		await writeJsonFile(data, output);
	}
	if (error) throw error;
}

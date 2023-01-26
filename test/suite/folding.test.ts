'use strict';

import * as vscode from 'vscode';
import * as path from 'path';
import * as glob from 'glob';
import * as fs from 'fs';
import * as assert from 'assert';
import deepEqual = require('deep-equal');
import * as writeJsonFile from 'write-json-file';
import * as loadJsonFile from 'load-json-file';

import lsp from '../util/lsp';
import jsonify from '../util/jsonify';
import type { JsonArray } from 'type-fest';

suite('src/folding.ts', function() {
	this.timeout(10000);
	test('TextmateFoldingRangeProvider class', async function() {
		vscode.window.showInformationMessage('TextmateFoldingRangeProvider class (src/folding.ts)');

		const foldingRangeProvider = await lsp.createFoldingRangeProvider();
		const foldingContext = {};
		const cancelToken = new vscode.CancellationTokenSource().token;

		const files = glob.sync(path.resolve(__dirname, '../../../../../samples/*.m'));

		for (const file of files) {
			const resource = vscode.Uri.file(file);
			const document = await vscode.workspace.openTextDocument(resource);

			const p = path.resolve(__dirname, '../../../../../data/foldingProvider', path.basename(file)).replace(/\.m$/, '.json');
			const folds = jsonify<JsonArray>(await foldingRangeProvider.provideFoldingRanges(document, foldingContext, cancelToken));

			if (fs.existsSync(p)) {
				assert.strictEqual(deepEqual(folds, loadJsonFile.sync(p)), true, p);
			}
			writeJsonFile.sync(p, folds, { indent: '  ' });
		}

		await vscode.commands.executeCommand('workbench.action.closeAllEditors');
	});
});

'use strict';

import * as vscode from 'vscode';
import type { JsonArray } from 'type-fest';

import lsp from '../util/lsp';
import jsonify from '../util/jsonify';
import { SAMPLE_FILE_BASENAMES, getSampleFileUri } from '../util/files';
import tester from '../util/tester';

const foldingRangeProviderPromise = lsp.createFoldingRangeProvider();

suite('src/folding.ts (test/suite/folding.test.ts)', function() {
	this.timeout(10000);

	test('TextmateFoldingRangeProvider class', async function() {
		vscode.window.showInformationMessage('TextmateFoldingRangeProvider class (src/folding.ts)');

		const foldingRangeProvider = await foldingRangeProviderPromise;

		const foldingContext = {};
		const cancelToken = new vscode.CancellationTokenSource().token;

		const samples = SAMPLE_FILE_BASENAMES.map(getSampleFileUri);

		for (let index = 0; index < samples.length; index++) {
			const resource = samples[index];
			const basename = `${SAMPLE_FILE_BASENAMES[index]}.m`;

			const document = await vscode.workspace.openTextDocument(resource);

			const folds = jsonify<JsonArray>(await foldingRangeProvider.provideFoldingRanges(document, foldingContext, cancelToken));

			await tester('folding', basename, folds);
		}

		await vscode.commands.executeCommand('workbench.action.closeAllEditors');
	});
});

'use strict';

import * as vscode from 'vscode';

import { context, foldingRangeProviderPromise } from '../util/factory';
import { SAMPLE_FILE_BASENAMES, getSampleFileUri } from '../util/files';
import { sampler } from '../util/sampler';

suite('src/folding.ts', function() {
	test('TextmateFoldingRangeProvider class', async function() {
		this.timeout(10000);
		vscode.window.showInformationMessage('TextmateFoldingRangeProvider class (src/folding.ts)');

		const foldingRangeProvider = await foldingRangeProviderPromise;

		const foldingContext = {};
		const cancelToken = new vscode.CancellationTokenSource().token;

		const samples = SAMPLE_FILE_BASENAMES.map(getSampleFileUri, context);
		const results: vscode.FoldingRange[][] = [];

		for (let index = 0; index < samples.length; index++) {
			const resource = samples[index];
			const document = await vscode.workspace.openTextDocument(resource);

			const folds = await foldingRangeProvider.provideFoldingRanges(document, foldingContext, cancelToken);

			results.push(folds);
		}

		for (let index = 0; index < samples.length; index++) {
			const basename = SAMPLE_FILE_BASENAMES[index];
			const folds = results[index];
			await sampler.call(context, 'folding', basename, folds);
		}

		await vscode.commands.executeCommand('workbench.action.closeAllEditors');

	});
});

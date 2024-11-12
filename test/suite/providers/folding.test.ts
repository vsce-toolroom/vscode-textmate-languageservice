'use strict';

import * as vscode from 'vscode';

import { documentServicePromise, foldingRangeProviderPromise } from '../../util/factory';
import { BASENAMES, getSampleFileUri } from '../../util/files';
import { runSamplePass } from '../../util/bench';

suite('test/suite/folding.test.ts - TextmateFoldingRangeProvider class (src/folding.ts)', function() {
	this.timeout(10000);

	test('TextmateFoldingRangeProvider.provideFoldingRanges(): Promise<vscode.FoldingRange[]>', async function() {
		void vscode.window.showInformationMessage('TextmateFoldingRangeProvider class (src/folding.ts)');
		const { results, samples } = await foldingRangeProviderResult();

		let error: TypeError | void = void 0;
		for (let index = 0; index < samples.length; index++) {
			const basename = BASENAMES[globalThis.languageId][index];
			const folds = results[index];

			try {
				await runSamplePass('folding', basename, folds);
			} catch (e) {
				error = typeof error !== 'undefined' ? error : e as Error;
			}
		}
		if (error) {
			throw error;
		}
	});

	this.afterAll(async function() {
		await vscode.commands.executeCommand('workbench.action.closeAllEditors');
	});
});

async function foldingRangeProviderResult() {
	const documentService = await documentServicePromise;
	const foldingRangeProvider = await foldingRangeProviderPromise;

	const foldingContext = {};
	const cancelToken = new vscode.CancellationTokenSource().token;

	const samples = BASENAMES[globalThis.languageId].map(getSampleFileUri);
	const results: vscode.FoldingRange[][] = [];

	for (const resource of samples) {
		const document = await documentService.getDocument(resource);

		const folds = await foldingRangeProvider.provideFoldingRanges(document, foldingContext, cancelToken);

		results.push(folds);
	}

	return { results, samples };
}

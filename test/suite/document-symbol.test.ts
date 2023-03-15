'use strict';

import * as vscode from 'vscode';

import { matlabContext, matlabDocumentServicePromise, matlabDocumentSymbolProviderPromise } from '../util/factory';
import { SAMPLE_FILE_BASENAMES, getSampleFileUri } from '../util/files';
import { runSamplePass } from '../util/bench';

suite('test/suite/document-symbol.test.ts - TextmateDocumentSymbolProvider class (src/document-symbol.ts)', async function() {
	this.timeout(10000);

	test('TextmateDocumentSymbolProvider.provideDocumentSymbols(): Promise<vscode.DocumentSymbol[]>', async function() {
		vscode.window.showInformationMessage('TextmateDocumentSymbolProvider class (src/document-symbol.ts)');
		const samples = await documentSymbolProviderResult();

		let error: TypeError | void = void 0;
		for (let index = 0; index < samples.length; index++) {
			const basename = SAMPLE_FILE_BASENAMES[index];
			const symbols = samples[index];

			try {
				await runSamplePass(matlabContext, 'document-symbol', basename, symbols);
			} catch (e) {
				error = typeof error !== 'undefined' ? error : e as Error;
			}
		}
		if (error) {
			throw error;
		}
	});
});

async function documentSymbolProviderResult() {
	const samples = SAMPLE_FILE_BASENAMES.map(getSampleFileUri, matlabContext);

	const documentService = await matlabDocumentServicePromise;
	const documentSymbolProvider = await matlabDocumentSymbolProviderPromise;
	const results: vscode.DocumentSymbol[][] = [];

	for (let index = 0; index < samples.length; index++) {
		const resource = samples[index];
		const document = await documentService.getDocument(resource);

		const symbols = await documentSymbolProvider.provideDocumentSymbols(document);

		results.push(symbols);
	}

	return results;
}

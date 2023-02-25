'use strict';

import * as vscode from 'vscode';

import { extensionContext, documentServicePromise, documentSymbolProviderPromise } from '../util/factory';
import { SAMPLE_FILE_BASENAMES, getSampleFileUri } from '../util/files';
import { runSamplePass } from '../util/bench';

suite('test/suite/document-symbol.test.ts - TextmateDocumentSymbolProvider class (src/document-symbol.ts)', async function() {
	this.timeout(10000);

	test('TextmateDocumentSymbolProvider.provideDocumentSymbols(): Promise<vscode.DocumentSymbol[]>', async function() {
		vscode.window.showInformationMessage('TextmateDocumentSymbolProvider class (src/document-symbol.ts)');
		const samples = await documentSymbolProviderResult();

		let error: TypeError | void;
		for (let index = 0; index < samples.length; index++) {
			const basename = SAMPLE_FILE_BASENAMES[index];
			const symbols = samples[index];

			try {
				await runSamplePass(extensionContext, 'document-symbol', basename, symbols);
			} catch (e) {
				error = error || e as TypeError;
			}
		}
		if (error) {
			throw error;
		}
	});
});

async function documentSymbolProviderResult() {
	const samples = SAMPLE_FILE_BASENAMES.map(getSampleFileUri, extensionContext);

	const documentService = await documentServicePromise;
	const documentSymbolProvider = await documentSymbolProviderPromise;
	const results: vscode.DocumentSymbol[][] = [];

	for (let index = 0; index < samples.length; index++) {
		const resource = samples[index];
		const document = await documentService.getDocument(resource);

		const symbols = await documentSymbolProvider.provideDocumentSymbols(document);

		results.push(symbols);
	}

	return results;
}

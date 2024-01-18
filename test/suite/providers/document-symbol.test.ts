'use strict';

import * as vscode from 'vscode';

import { documentServicePromise, documentSymbolProviderPromise } from '../../util/factory';
import { BASENAMES, getSampleFileUri } from '../../util/files';
import { runSamplePass } from '../../util/bench';

suite('test/suite/document-symbol.test.ts - TextmateDocumentSymbolProvider class (src/document-symbol.ts)', function() {
	this.timeout(10000);

	test('TextmateDocumentSymbolProvider.provideDocumentSymbols(): Promise<vscode.DocumentSymbol[]>', async function() {
		void vscode.window.showInformationMessage('TextmateDocumentSymbolProvider class (src/document-symbol.ts)');
		const samples = await documentSymbolProviderResult();

		let error: TypeError | void = void 0;
		for (let index = 0; index < samples.length; index++) {
			const basename = BASENAMES[globalThis.languageId][index];
			const symbols = samples[index];

			try {
				await runSamplePass('document-symbol', basename, symbols);
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
	const samples = BASENAMES[globalThis.languageId].map(getSampleFileUri);

	const documentService = await documentServicePromise;
	const documentSymbolProvider = await documentSymbolProviderPromise;
	const results: vscode.DocumentSymbol[][] = [];

	for (const resource of samples) {
		const document = await documentService.getDocument(resource);

		const symbols = await documentSymbolProvider.provideDocumentSymbols(document);

		results.push(symbols);
	}

	return results;
}

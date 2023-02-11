'use strict';

import * as vscode from 'vscode';

import { context, documentServicePromise, documentSymbolProviderPromise } from '../util/factory';
import { SAMPLE_FILE_BASENAMES, getSampleFileUri } from '../util/files';
import { sampler } from '../util/sampler';

suite('src/document-symbol.ts', function() {
	test('TextmateDocumentSymbolProvider class', async function() {
		this.timeout(10000);
		vscode.window.showInformationMessage('TextmateDocumentSymbolProvider class (src/document-symbol.ts)');

		const samples = SAMPLE_FILE_BASENAMES.map(getSampleFileUri, context);

		const documentService = await documentServicePromise;
		const documentSymbolProvider = await documentSymbolProviderPromise;
		const outputs: vscode.DocumentSymbol[][] = [];

		for (let index = 0; index < samples.length; index++) {
			const resource = samples[index];
			const document = await documentService.getDocument(resource);

			const symbols = await documentSymbolProvider.provideDocumentSymbols(document);

			outputs.push(symbols);
		}

		test('provideDocumentSymbols(): Promise<vscode.DocumentSymbol[]>', async function() {
			for (let index = 0; index < samples.length; index++) {
				const basename = SAMPLE_FILE_BASENAMES[index];
				const symbols = outputs[index];
				await sampler.call(context, 'document-symbol', basename, symbols);
			}
		});
	});
});

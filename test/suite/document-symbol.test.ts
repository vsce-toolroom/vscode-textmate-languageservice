'use strict';

import * as vscode from 'vscode';

import lsp from '../util/lsp';
import jsonify from '../util/jsonify';
import { SAMPLE_FILE_BASENAMES, getSampleFileUri } from '../util/files';
import tester from '../util/tester';

import type { JsonArray } from 'type-fest';

const workspaceDocumentServicePromise = lsp.initWorkspaceDocumentService();
const documentSymbolProviderPromise = lsp.createDocumentSymbolProvider();

suite('src/document-symbol.ts (test/suite/document-symbol.ts)', async function() {
	this.timeout(10000);

	test('TextmateDocumentSymbolProvider class', async function() {
		vscode.window.showInformationMessage('TextmateDocumentSymbolProvider class (src/document-symbol.ts)');

		const samples = SAMPLE_FILE_BASENAMES.map(getSampleFileUri);

		const workspaceDocumentService = await workspaceDocumentServicePromise;
		const documentSymbolProvider = await documentSymbolProviderPromise;

		for (let index = 0; index < samples.length; index++) {
			const resource = samples[index];
			const basename = `${SAMPLE_FILE_BASENAMES[index]}.m`;

			const document = await workspaceDocumentService.getDocument(resource);

			const symbols = jsonify<JsonArray>(await documentSymbolProvider.provideDocumentSymbols(document));

			await tester('document-symbol', basename, symbols);
		}
	});
});

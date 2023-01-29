'use strict';

import * as vscode from 'vscode';

import lsp from '../util/lsp';
import jsonify from '../util/jsonify';
import { SAMPLE_FILE_BASENAMES, getSampleFileUri,  } from '../util/files';
import tester from '../util/tester';

import type { JsonArray } from 'type-fest';

const workspaceDocumentServicePromise = lsp.initWorkspaceDocumentService();
const tokenizerPromise = lsp.initTokenizerService();

suite('src/services/tokenizer.ts (test/suite/tokenizer.service.test.ts)', async function() {
	this.timeout(10000);

	test('TextmateTokenizerService class', async function() {
		vscode.window.showInformationMessage('TextmateTokenizerService class (src/services/tokenizer.ts)');

		const workspaceDocumentService = await workspaceDocumentServicePromise;
		const tokenizer = await tokenizerPromise;
		
		const samples = SAMPLE_FILE_BASENAMES.map(getSampleFileUri);

		for (let index = 0; index < samples.length; index++) {
			const resource = samples[index];
			const basename = `${SAMPLE_FILE_BASENAMES[index]}.m`;

			const document = await workspaceDocumentService.getDocument(resource);
			const tokens = jsonify<JsonArray>(await tokenizer.fetch(document));

			await tester('tokenizer', basename, tokens);
		}
	});
});

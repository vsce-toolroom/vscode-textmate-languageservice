'use strict';

import * as vscode from 'vscode';
import type { JsonArray } from 'type-fest';

import lsp from '../util/lsp';
import jsonify from '../util/jsonify';
import { SAMPLE_FILE_BASENAMES, getSampleFileUri } from '../util/files';
import tester from '../util/tester';

const workspaceDocumentServicePromise = lsp.initWorkspaceDocumentService();
const documentOutlineServicePromise = lsp.initDocumentOutlineService();

suite('src/services/outline.ts (test/suite/outline.service.test.ts)', function() {
	this.timeout(10000);

	test('DocumentOutlineService class', async function() {
		vscode.window.showInformationMessage('DocumentOutlineService class (src/services/outline.ts)');

		const workspaceDocumentService = await workspaceDocumentServicePromise;
		const documentOutlineService = await documentOutlineServicePromise;

		const samples = SAMPLE_FILE_BASENAMES.map(getSampleFileUri);

		for (let index = 0; index < samples.length; index++) {
			const resource = samples[index];
			const basename = `${SAMPLE_FILE_BASENAMES[index]}.m`;

			const document = await workspaceDocumentService.getDocument(resource);
			const outline = jsonify<JsonArray>(await documentOutlineService.fetch(document));

			await tester('outline', basename, outline);
		}
	});
});

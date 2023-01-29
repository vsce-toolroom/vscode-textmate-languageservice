'use strict';

import * as vscode from 'vscode';
import * as assert from 'assert';

import lsp from '../util/lsp';
import { SAMPLE_FILE_BASENAMES, getSampleFileUri } from '../util/files';

const workspaceDocumentServicePromise = lsp.initWorkspaceDocumentService();

suite('src/services/document.ts (test/suite/document.service.test.ts)', function() {
	this.timeout(10000);

	test('WorkspaceDocumentService class', async function() {
		vscode.window.showInformationMessage('WorkspaceDocumentService class (src/services/document.ts)');

		const workspaceDocumentService = await workspaceDocumentServicePromise;

		const samples = SAMPLE_FILE_BASENAMES.map(getSampleFileUri);

		for (let index = 0; index < samples.length; index++) {
			const sample = samples[index];

			const document = await vscode.workspace.openTextDocument(sample);

			const providerDocument = await workspaceDocumentService.getDocument(sample);

			assert.strictEqual(
				document.uri.toString(),
				providerDocument.uri.toString(),
				`SkinnyTextDocument.uri: expected '${document.uri.path}' but found '${providerDocument.uri.path}'.`
			);
			assert.strictEqual(
				document.lineCount,
				providerDocument.lineCount,
				`SkinnyTextDocument.lineCount: expected ${document.lineCount} lines but found ${providerDocument.lineCount} lines.`
			);
			assert.strictEqual(
				document.lineAt(0).text,
				providerDocument.lineAt(0).text,
				`SkinnyTextDocument.lineAt(0): expected line 0 to be "'${document.lineAt(0).text}'" but found "'${providerDocument.lineAt(0).text}'".`
			);
		}

		await vscode.commands.executeCommand('workbench.action.closeAllEditors');
	});
});

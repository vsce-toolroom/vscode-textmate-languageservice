'use strict';

import * as vscode from 'vscode';
import { strictEqual } from '../util/assert';

import { typescriptContext, typescriptDocumentServicePromise } from '../util/factory';
import { SERVICE_SAMPLE_BASENAME, getSampleFileUri } from '../util/files';
import { jsonify } from '../util/jsonify';

suite('test/suite/document-service.test.ts - DocumentService class (src/services/document.ts)', async function() {
	this.timeout(5000);

	test('LiteTextDocument.uri', async function() {
		vscode.window.showInformationMessage('DocumentService class (src/services/document.ts)');
		const { actual, expected, filename } = await documentServiceOutput();
		const textDocument = expected;
		const providerDocument = actual;
		strictEqual(textDocument.uri.toString(), providerDocument.uri.toString(), filename);
	});

	test('LiteTextDocument.lineCount', async function() {
		const { actual, expected, filename } = await documentServiceOutput();
		const textDocument = expected;
		const providerDocument = actual;
		strictEqual(textDocument.lineCount, providerDocument.lineCount, filename);
	});

	test('LiteTextDocument.lineAt(line: number)', async function() {
		const { actual, expected, filename } = await documentServiceOutput();
		const textDocument = expected;
		const providerDocument = actual;
		strictEqual(textDocument.lineAt(0).text, providerDocument.lineAt(0).text, filename);
	});

	await vscode.commands.executeCommand('workbench.action.closeAllEditors');
});

async function documentServiceOutput() {
	const documentService = await typescriptDocumentServicePromise;

	const resource = getSampleFileUri.call(typescriptContext, SERVICE_SAMPLE_BASENAME);

	const expected = await vscode.workspace.openTextDocument(resource);
	const actual = await documentService.getDocument(resource);
	const filename: string = jsonify<string>(expected.uri);

	return { actual, expected, filename };
}

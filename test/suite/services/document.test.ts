'use strict';

import * as vscode from 'vscode';
import { strictEqual } from '../../util/assert';

import { documentServicePromise } from '../../util/factory';
import { BASENAMES, getSampleFileUri } from '../../util/files';
import { jsonify } from '../../util/jsonify';

import type { FullTextDocument } from '../../../src/services/document';

suite('test/suite/document.test.ts - DocumentService class (src/services/document.ts)', function() {
	this.timeout(5000);

	test('FullTextDocument.uri', async function() {
		void vscode.window.showInformationMessage('DocumentService class (src/services/document.ts)');
		const { actuals, expecteds, filenames, samples } = await documentServiceOutput();

		for (let index = 0; index < samples.length; index++) {
			const textDocument = expecteds[index];
			const providerDocument = actuals[index];
			strictEqual(textDocument.uri.toString(true), providerDocument.uri.toString(true), filenames[index]);
		}
	});

	test('FullTextDocument.lineCount', async function() {
		const { actuals, expecteds, filenames, samples } = await documentServiceOutput();

		for (let index = 0; index < samples.length; index++) {
			const textDocument = expecteds[index];
			const providerDocument = actuals[index];
			strictEqual(textDocument.lineCount, providerDocument.lineCount, filenames[index]);
		}
	});

	test('FullTextDocument.lineAt(line: number)', async function() {
		const { actuals, expecteds, filenames, samples } = await documentServiceOutput();

		for (let index = 0; index < samples.length; index++) {
			const textDocument = expecteds[index];
			const providerDocument = actuals[index];
			strictEqual(textDocument.lineAt(0).text, providerDocument.lineAt(0).text, filenames[index]);
		}
	});

	this.afterAll(async function() {
		await vscode.commands.executeCommand('workbench.action.closeAllEditors');
	});
});

async function documentServiceOutput() {
	const documentService = await documentServicePromise;

	const samples = BASENAMES[globalThis.languageId].map(getSampleFileUri);

	const expecteds: vscode.TextDocument[] = [];
	const actuals: vscode.TextDocument[] = [];
	const filenames: string[] = [];

	for (const resource of samples) {
		const textDocument = await vscode.workspace.openTextDocument(resource);
		const providerDocument = await documentService.getDocument(resource);

		expecteds.push(textDocument);
		actuals.push(providerDocument);

		filenames.push(jsonify<string>(textDocument.uri));
	}

	return { actuals, expecteds, filenames, samples };
}

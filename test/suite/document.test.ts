'use strict';

import * as vscode from 'vscode';
import { strictEqual } from '../util/assert';

import { matlabContext, matlabDocumentServicePromise } from '../util/factory';
import { SAMPLE_FILE_BASENAMES, getSampleFileUri } from '../util/files';
import { jsonify } from '../util/jsonify';

import type { LiteTextDocument } from '../../src/services/document';

suite('test/suite/document.test.ts - DocumentService class (src/services/document.ts)', async function() {
	this.timeout(5000);

	test('LiteTextDocument.uri', async function() {
		vscode.window.showInformationMessage('DocumentService class (src/services/document.ts)');
		const { actuals, expecteds, filenames, samples } = await documentServiceOutput();

		for (let index = 0; index < samples.length; index++) {
			const textDocument = expecteds[index];
			const providerDocument = actuals[index];
			strictEqual(textDocument.uri.toString(), providerDocument.uri.toString(), filenames[index]);
		}
	});

	test('LiteTextDocument.lineCount', async function() {
		const { actuals, expecteds, filenames, samples } = await documentServiceOutput();

		for (let index = 0; index < samples.length; index++) {
			const textDocument = expecteds[index];
			const providerDocument = actuals[index];
			strictEqual(textDocument.lineCount, providerDocument.lineCount, filenames[index]);
		}
	});

	test('LiteTextDocument.lineAt(line: number)', async function() {
		const { actuals, expecteds, filenames, samples } = await documentServiceOutput();

		for (let index = 0; index < samples.length; index++) {
			const textDocument = expecteds[index];
			const providerDocument = actuals[index];
			strictEqual(textDocument.lineAt(0).text, providerDocument.lineAt(0).text, filenames[index]);
		}
	});

	await vscode.commands.executeCommand('workbench.action.closeAllEditors');
});

async function documentServiceOutput() {
	const documentService = await matlabDocumentServicePromise;

	const samples = SAMPLE_FILE_BASENAMES.map(getSampleFileUri, matlabContext);

	const expecteds: vscode.TextDocument[] = [];
	const actuals: LiteTextDocument[] = [];
	let filenames: string[] = [];

	for (let index = 0; index < samples.length; index++) {
		const resource = samples[index];

		const textDocument = await vscode.workspace.openTextDocument(resource);
		const providerDocument = await documentService.getDocument(resource);

		expecteds.push(textDocument);
		actuals.push(providerDocument);

		filenames.push(jsonify<string>(textDocument.uri));
	}

	return { actuals, expecteds, filenames, samples };
}

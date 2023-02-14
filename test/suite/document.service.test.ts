'use strict';

import * as vscode from 'vscode';
import * as assert from '../util/assert';

import { context, documentServicePromise } from '../util/factory';
import { SAMPLE_FILE_BASENAMES, getSampleFileUri } from '../util/files';
import { jsonify } from '../util/jsonify';

import type { SkinnyTextDocument } from 'src/services/document';

suite('src/services/document.ts', function() {
	test('DocumentService class', async function() {
		this.timeout(5000);
		vscode.window.showInformationMessage('DocumentService class (src/services/document.ts)');

		const documentService = await documentServicePromise;

		const samples = SAMPLE_FILE_BASENAMES.map(getSampleFileUri, context);

		const expecteds: vscode.TextDocument[] = [];
		const actuals: SkinnyTextDocument[] = [];
		let filenames: string[] = [];

		for (let index = 0; index < samples.length; index++) {
			const resource = samples[index];

			const textDocument = await vscode.workspace.openTextDocument(resource);
			const providerDocument = await documentService.getDocument(resource);

			expecteds.push(textDocument);
			actuals.push(providerDocument);

			filenames.push(textDocument.uri as unknown as string);
		}

		filenames = jsonify(filenames);

		test('SkinnyTextDocument.uri', function() {
			for (let index = 0; index < samples.length; index++) {
				const textDocument = expecteds[index];
				const providerDocument = actuals[index];
				assert.strictEqual(textDocument.uri.toString(), providerDocument.uri.toString(), filenames[index]);
			}
		});

		test('SkinnyTextDocument.lineCount', function() {
			for (let index = 0; index < samples.length; index++) {
				const textDocument = expecteds[index];
				const providerDocument = actuals[index];
				assert.strictEqual(textDocument.lineCount, providerDocument.lineCount, filenames[index]);
			}
		});

		test('SkinnyTextDocument.lineAt(line: number)', function() {
			for (let index = 0; index < samples.length; index++) {
				const textDocument = expecteds[index];
				const providerDocument = actuals[index];
				assert.strictEqual(textDocument.lineAt(0).text, providerDocument.lineAt(0).text, filenames[index]);
			}
		});

		await vscode.commands.executeCommand('workbench.action.closeAllEditors');
	});

});

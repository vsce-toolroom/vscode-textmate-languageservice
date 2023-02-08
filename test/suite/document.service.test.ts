'use strict';

import * as vscode from 'vscode';
import { describe, test, expect } from '@jest/globals';

import { SAMPLE_FILE_BASENAMES, getSampleFileUri } from '../util/files';
import { documentServicePromise } from '../util/factory';
import type { SkinnyTextDocument } from '../../src/services/document';

describe('src/services/document.ts', function() {
	test('DocumentService class', async function() {
		vscode.window.showInformationMessage('DocumentService class (src/services/document.ts)');

		const documentService = await documentServicePromise;

		const samples = SAMPLE_FILE_BASENAMES.map(getSampleFileUri);

		const expecteds: vscode.TextDocument[] = [];
		const actuals: SkinnyTextDocument[] = [];

		for (let index = 0; index < samples.length; index++) {
			const resource = samples[index];

			const textDocument = await vscode.workspace.openTextDocument(resource);
			const providerDocument = await documentService.getDocument(resource);

			expecteds.push(textDocument);
			actuals.push(providerDocument);
		}

		test('SkinnyTextDocument.uri', function() {
			for (let index = 0; index < samples.length; index++) {
				const textDocument = expecteds[index];
				const providerDocument = actuals[index];
				expect(textDocument.uri.toString()).toStrictEqual(providerDocument.uri.toString());
			}
		});

		test('SkinnyTextDocument.lineCount', function() {
			for (let index = 0; index < samples.length; index++) {
				const textDocument = expecteds[index];
				const providerDocument = actuals[index];
				expect(textDocument.lineCount).toStrictEqual(providerDocument.lineCount);
			}
		});

		test('SkinnyTextDocument.lineAt(line: number)', function() {
			for (let index = 0; index < samples.length; index++) {
				const textDocument = expecteds[index];
				const providerDocument = actuals[index];
				expect(textDocument.lineAt(0).text).toStrictEqual(providerDocument.lineAt(0).text);
			}
		});

		await vscode.commands.executeCommand('workbench.action.closeAllEditors');

	}, 5000);

});

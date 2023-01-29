'use strict';

import * as vscode from 'vscode';
import * as assert from 'assert';
import type { JsonArray } from 'type-fest';

import { TextmateScopeSelector } from '../../src/util/selectors';
import type { TextmateToken } from '../../src/services/tokenizer';

import lsp from '../util/lsp';
import jsonify from '../util/jsonify';
import { BASE_CLASS_NAME, SAMPLE_FILE_BASENAMES, getSampleFileUri } from '../util/files';
import tester from '../util/tester';

const classReferenceSelector = new TextmateScopeSelector([
	'meta.inherited-class entity.name.type.class',
	'meta.method-call entity.name.type.class'
]);

const workspaceDocumentServicePromise = lsp.initWorkspaceDocumentService();
const definitionProviderPromise = lsp.createDefinitionProvider();
const tokenizerPromise = lsp.initTokenizerService();

suite('src/definition.ts (test/suite/definition.ts)', async function() {
	this.timeout(10000);

	test('TextmateDefinitionProvider class', async function() {
		vscode.window.showInformationMessage('TextmateDefinitionProvider class (src/definition.ts)');

		const workspaceDocumentService = await workspaceDocumentServicePromise;
		const definitionProvider = await definitionProviderPromise;
		const tokenizer = await tokenizerPromise;

		const samples = SAMPLE_FILE_BASENAMES.map(getSampleFileUri);

		for (let index = 0; index < samples.length; index++) {
			const resource = samples[index];
			const basename = `${SAMPLE_FILE_BASENAMES[index]}.m`;

			const skinnyDocument = await workspaceDocumentService.getDocument(resource);
			const tokens = await tokenizer.fetch(skinnyDocument);

			const document = await vscode.workspace.openTextDocument(resource);
			await vscode.window.showTextDocument(document);
			const activeEditor = vscode.window.activeTextEditor;

			let definitions = [];

			for (const token of tokens.filter(isClassReferenceToken)) {
				const startPosition = new vscode.Position(token.line, token.startIndex);
				const endPosition = new vscode.Position(token.line, token.endIndex);

				activeEditor.selection = new vscode.Selection(startPosition, endPosition);
				const definitionResults = await definitionProvider.provideDefinition(document, startPosition);

				assert.strictEqual(
					[1, 2].includes(definitionResults.length),
					true,
					`Could not go to ${token.text} class from ${basename}.`
				);
				definitions.push({
					...token,
					uri: resource,
					definition: definitionResults[0]
				});
			}

			definitions = jsonify<JsonArray>(definitions);

			await tester('definition', basename, definitions);
		}

		await vscode.commands.executeCommand('workbench.action.closeAllEditors');
	});
});

function isClassReferenceToken(token: TextmateToken) {
	return (
		classReferenceSelector.match(token.scopes)
		&& token.text === BASE_CLASS_NAME
	);
}

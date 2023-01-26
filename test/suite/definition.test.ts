'use strict';

import * as vscode from 'vscode';
import * as glob from 'glob';
import * as path from 'path';
import * as assert from 'assert';
import deepEqual = require('deep-equal');
import * as fs from 'fs';
import writeJsonFile = require('write-json-file');
import loadJsonFile = require('load-json-file');
import type { JsonArray } from 'type-fest';

import { TextmateScopeSelector } from '../../src/util/selectors';
import type { TextmateToken } from '../../src/services/tokenizer';

import lsp from '../util/lsp';
import jsonify from '../util/jsonify';

const classReferenceSelector = new TextmateScopeSelector([
	'meta.inherited-class entity.name.type.class',
	'meta.method-call entity.name.type.class'
]);

const BASE_CLASS_NAME = 'Animal';

suite('src/definition.ts', function() {
	this.timeout(10000);
	test('TextmateDefinitionProvider class', async function() {
		vscode.window.showInformationMessage('TextmateDefinitionProvider class (src/definition.ts)');

		const workspaceDocumentService = await lsp.initWorkspaceDocumentService();
		const definitionProvider = await lsp.createDefinitionProvider();

		const files = glob.sync(path.resolve(__dirname, '../../../../../samples/*.m'));

		for (const file of files) {
			const resource = vscode.Uri.file(file);
			const basename = path.basename(file);

			const skinnyDocument = await workspaceDocumentService.getDocument(resource);
			const tokenizer = await lsp.initTokenizerService();
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

			const p = path.resolve(__dirname, '../../../../../data/peekDefinitionProvider', basename).replace(/\.m$/, '.json');

			if (fs.existsSync(p)) {
				assert.strictEqual(deepEqual(definitions, loadJsonFile.sync(p)), true, p);
			}
			writeJsonFile.sync(p, definitions, { indent: '  ' });
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

'use strict';

import * as vscode from 'vscode';
import * as glob from 'glob';
import * as path from 'path';
import * as assert from 'assert';
import deepEqual = require('deep-equal');
import * as fs from 'fs';
import * as writeJsonFile from 'write-json-file';
import * as loadJsonFile from 'load-json-file';
import type { JsonArray } from 'type-fest';

import { TextmateScopeSelector } from '../../src/parser/selectors';
import type { TextmateToken } from '../../src/services/tokenizer';

import lsp from '../util/lsp';
import jsonify from '../util/jsonify';

const classReferenceSelector = new TextmateScopeSelector([
	'meta.inherited-class entity.name.type.class',
	'meta.method-call entity.name.type.class'
]);

const BASE_CLASS_NAME = 'Animal';

suite('src/definition.ts', function() {
	this.timeout(20000);
	test('DefinitionProvider class', async function() {
		const workspaceDocumentService = await lsp.createWorkspaceDocumentService();
		const definitionProvider = await lsp.createDefinitionProvider();

		const files = glob.sync(path.resolve(__dirname, '../../../../../../animals/*.m'));

		for (const file of files) {
			const resource = vscode.Uri.file(file);

			const skinnyDocument = await workspaceDocumentService.getDocument(resource);
			const tokens = await lsp.tokenizer.tokenize(skinnyDocument);

			const document = await vscode.workspace.openTextDocument(resource);
			await vscode.window.showTextDocument(document);
			const activeEditor = vscode.window.activeTextEditor;

			let definitions = [];

			for (const token of tokens.filter(isClassReferenceToken)) {
				const startPosition = new vscode.Position(token.line, token.startIndex);
				const endPosition = new vscode.Position(token.line, token.endIndex);

				activeEditor.selection = new vscode.Selection(startPosition, endPosition);
				const definitionResults = await definitionProvider.provideDefinition(document, startPosition);

				assert.strictEqual([1, 2].includes(definitionResults.length), true, `${token.text} class defined ${definitionResults.length} times.`);
				definitions.push({
					...token,
					uri: resource,
					definition: definitionResults[0]
				});
			}

			definitions = jsonify<JsonArray>(definitions);

			const p = path.resolve(__dirname, '../data/peekDefinitionProvider', path.basename(file)).replace(/\.m$/, '.json');

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

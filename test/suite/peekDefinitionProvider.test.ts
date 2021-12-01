import vscode from 'vscode';
import glob from 'glob';
import path from 'path';
import assert from 'assert';
import fs from 'fs';
import deepEqual from 'deep-equal';
import writeJsonFile from 'write-json-file';
import loadJsonFile from 'load-json-file';
import { TextmateToken, TextmateEngine, TextmateScopeSelector } from '../../src/textmateEngine';
import { DocumentSymbolProvider } from '../../src/documentSymbolProvider';
import { WorkspaceDocumentProvider } from '../../src/workspaceSymbolProvider';
import { PeekDefinitionProvider } from '../../src/peekDefinitionProvider';
import jsonify from './jsonify';

const engine = new TextmateEngine('matlab', 'source.matlab');
const documentSymbolProvider = new DocumentSymbolProvider(engine);
const workspaceDocumentProvider = new WorkspaceDocumentProvider('matlab');
const peekDefinitionProvider = new PeekDefinitionProvider(documentSymbolProvider);

const classReferenceSelector = new TextmateScopeSelector([
	'meta.inherited-class entity.name.type.class',
	'meta.method-call entity.name.type.class'
]);

const BASE_CLASS_NAME = 'Animal';

suite('src/peekDefinitionProvider.ts', function() {
	this.timeout(60000);
	test('PeekDefinitionProvider class', async function() {
		const files = glob.sync(path.resolve(__dirname, '../../../../../../animals/*.m'));

		for (const file of files) {
			const resource = vscode.Uri.file(file);

			const skinnyDocument = await workspaceDocumentProvider.getDocument(resource);
			const tokens = await engine.tokenize('source.matlab', skinnyDocument);

			const document = await vscode.workspace.openTextDocument(resource);
			await vscode.window.showTextDocument(document);
			const activeEditor = vscode.window.activeTextEditor;

			let definitions = [];

			for (const token of tokens.filter(isClassReferenceToken)) {
				const startPosition = new vscode.Position(token.line, token.startIndex);
				const endPosition = new vscode.Position(token.line, token.endIndex);

				activeEditor.selection = activeEditor.selections[0] = new vscode.Selection(startPosition, endPosition);
				const definitionResults = await peekDefinitionProvider.provideDefinition(document, startPosition);

				definitionResults[0].uri = (definitionResults[0] as any).uri.path;
				assert.strictEqual([1, 2].includes(definitionResults.length), true, `${token.text} class defined ${definitionResults.length} times.`);
				definitions.push({
					...token,
					uri: resource.path,
					definition: definitionResults[0]
				});
			}

			definitions = jsonify(definitions);

			const p = path
				.resolve(__dirname, '../data/peekDefinitionProvider', path.basename(file))
				.replace(/\.m$/, '.json');

			if (fs.existsSync(p)) {
				assert.strictEqual(deepEqual(loadJsonFile.sync(p), definitions), true, p);
			}
			writeJsonFile.sync(p, definitions, { indent: '  ' });
		}

		vscode.commands.executeCommand('workbench.action.closeAllEditors');
	});
});

function isClassReferenceToken(token: TextmateToken) {
	return (
		classReferenceSelector.match(token.scopes)
		&& token.text === BASE_CLASS_NAME
	);
}

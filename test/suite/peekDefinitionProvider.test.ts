import vscode from 'vscode';
import path from 'path';
import assert from 'assert';
import fs from 'fs';
import deepEqual from 'deep-equal';
import writeJsonFile from 'write-json-file';
import loadJsonFile from 'load-json-file';
import { TextmateEngine } from '../../src/textmateEngine';
import { DocumentSymbolProvider } from '../../src/documentSymbolProvider';
import { WorkspaceDocumentProvider } from '../../src/workspaceSymbolProvider';
import { PeekDefinitionProvider } from '../../src/peekDefinitionProvider';
import { TableOfContentsProvider } from '../../src/tableOfContentsProvider';
import ScopeSelector from '../../src/util/scope-selector';
import replacer from './replacer';

const engine = new TextmateEngine('matlab', 'source.matlab');
const tableOfContentsProvider = new TableOfContentsProvider(engine);
const documentSymbolProvider = new DocumentSymbolProvider(engine);
const workspaceDocumentProvider = new WorkspaceDocumentProvider('matlab');
const peekDefinitionProvider = new PeekDefinitionProvider(documentSymbolProvider);

const functionCallSelector = new ScopeSelector('meta.function-call.parens entity.name.function');

suite('src/tableOfContentsProvider.ts', function() {
	this.timeout(60000);
	test('PeekDefinitionProvider class', async function() {
		const file = path.resolve(__dirname, '../../../../../../mpm/mpm.m');
		const resource = vscode.Uri.file(file);

		const skinnyDocument = await workspaceDocumentProvider.getDocument(resource);
		const tokens = await engine.tokenize('source.matlab', skinnyDocument);
		const toc = await tableOfContentsProvider.getToc(skinnyDocument);

		const document = await vscode.workspace.openTextDocument(resource);
		await vscode.window.showTextDocument(document);
		const activeEditor = vscode.window.activeTextEditor;

		const definitions = [];

		const functionCallTokens = tokens.filter(isFunctionCallToken);

		for (const entry of toc.filter(isFunctionEntry)) {
			const call = functionCallTokens.find(function(token) {
				return token.text === entry.text;
			});

			const startPosition = new vscode.Position(call.line, call.startIndex);
			const endPosition = new vscode.Position(call.line, call.endIndex);

			activeEditor.selection = activeEditor.selections[0] = new vscode.Selection(startPosition, endPosition);
			const definitionResults = await peekDefinitionProvider.provideDefinition(document, startPosition);

			definitionResults[0].uri = (definitionResults[0] as any).uri.path;
			assert.strictEqual(definitionResults.length, 1, `${entry.text} function defined ${definitionResults.length} times.`);
			definitions.push({
				text: entry.text,
				token: entry.token,
				origin: entry.location.uri.path,
				definition: definitionResults[0]
			});
		}

		const p = path
			.resolve(__dirname, '../data/peekDefinitionProvider', path.basename(file))
			.replace(/\.m$/, '.json');

		writeJsonFile.sync(p, definitions, { indent: '  ' });
		if (fs.existsSync(p)) {
			deepEqual(loadJsonFile.sync(p), definitions);
		}
	});
});

function isFunctionCallToken(token) {
	return functionCallSelector.matches(token.scopes);
}

function isFunctionEntry(entry) {
	return entry.type === vscode.SymbolKind.Function;
}

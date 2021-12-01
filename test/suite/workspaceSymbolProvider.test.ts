import vscode from 'vscode';
import path from 'path';
import glob from 'glob';
import fs from 'fs';
import assert from 'assert';
import deepEqual from 'deep-equal';
import writeJsonFile from 'write-json-file';
import loadJsonFile from 'load-json-file';
import { TextmateEngine } from '../../src/textmateEngine';
import { DocumentSymbolProvider } from '../../src/documentSymbolProvider';
import { WorkspaceDocumentProvider, WorkspaceSymbolProvider } from '../../src/workspaceSymbolProvider';
import jsonify from './jsonify';

const workspaceDocumentProvider = new WorkspaceDocumentProvider('matlab');
const engine = new TextmateEngine('matlab', 'source.matlab');
const documentSymbolProvider = new DocumentSymbolProvider(engine);
const workspaceSymbolProvider = new WorkspaceSymbolProvider('matlab', documentSymbolProvider);

suite('src/workspaceSymbolProvider.ts', function() {
	this.timeout(60000);
	test('WorkspaceDocumentProvider class', async function() {
		const files = glob.sync(path.resolve(__dirname, '../../../../../../animals/*.m'));
		for (const file of files) {
			const resource = vscode.Uri.file(file);
			const document = await vscode.workspace.openTextDocument(resource);

			const providerDocument = await workspaceDocumentProvider.getDocument(resource);
			assert.strictEqual(
				document.uri.toString(),
				providerDocument.uri.toString(),
				`SkinnyTextDocument.uri: expected '${document.uri.path}' but found '${providerDocument.uri.path}'.`
			);
			assert.strictEqual(
				document.lineCount,
				providerDocument.lineCount,
				`SkinnyTextDocument.lineCount: expected ${document.lineCount} lines but found ${providerDocument.lineCount} lines.`
			);
			assert.strictEqual(
				document.lineAt(0).text,
				providerDocument.lineAt(0).text,
				`SkinnyTextDocument.lineAt(0): expected '${document.lineAt(0).text}' but found '${providerDocument.lineAt(0).text}' lines.`
			);
		}

		vscode.commands.executeCommand('workbench.action.closeAllEditors');
	});
	test('WorkspaceSymbolProvider class', async function() {
		const symbols = jsonify(await workspaceSymbolProvider.provideWorkspaceSymbols('obj.'));

		for (const symbol of symbols) {
			if (symbol?.location?.uri) {
				symbol.location.uri = symbol.location.uri.path as any;
			}
		}

		const p = path.resolve(__dirname, '../data/workspaceSymbolProvider', 'index.json');

		if (fs.existsSync(p)) {
			assert.strictEqual(deepEqual(loadJsonFile.sync(p), symbols), true);
		}
		writeJsonFile.sync(p, symbols, { indent: '  ' });
	});
});

import * as vscode from 'vscode';
import * as path from 'path';
import * as glob from 'glob';
import * as fs from 'fs';
import * as assert from 'assert';
import * as writeJsonFile from 'write-json-file';
import * as loadJsonFile from 'load-json-file';
import { TextmateEngine } from '../../src/textmateEngine';
import { DocumentSymbolProvider } from '../../src/documentSymbolProvider';
import { WorkspaceDocumentProvider, WorkspaceSymbolProvider } from '../../src/workspaceSymbolProvider';

const workspaceDocumentProvider = new WorkspaceDocumentProvider('matlab');
const engine = new TextmateEngine('matlab', 'source.matlab');
const documentSymbolProvider = new DocumentSymbolProvider(engine);
const workspaceSymbolProvider = new WorkspaceSymbolProvider('matlab', documentSymbolProvider);
const cancelToken = new vscode.CancellationTokenSource().token;

suite('src/foldingProvider.ts', function() {
	this.timeout(30000);
	test('WorkspaceDocumentProvider class', async function() {
		const files = glob.sync(path.resolve(__dirname, '../../../../../syntaxes/MATLAB-Language-grammar/test/snap/*.m'));
		for (const file of files) {
			const resource = vscode.Uri.file(file);
			const textDocument = await vscode.workspace.openTextDocument(resource);
			const providerDocument = await workspaceDocumentProvider.getDocument(resource);
			assert.strictEqual(textDocument.uri.toString(), providerDocument.uri.toString());
			assert.strictEqual(textDocument.lineCount, providerDocument.lineCount);
			assert.strictEqual(textDocument.lineAt(0).text, providerDocument.lineAt(0).text);
		}
	});
	test('WorkspaceSymbolProvider class', async function() {
		const files = glob.sync(path.resolve(__dirname, '../../../../../syntaxes/MATLAB-Language-grammar/test/snap/*.m'));
		for (const file of files) {
			const resource = vscode.Uri.file(file);
			await vscode.workspace.openTextDocument(resource);
			const symbols = await workspaceSymbolProvider.provideWorkspaceSymbols('obj.');
			const p = path.resolve(__dirname, '../data/workspaceSymbolProvider', path.basename(file));
			if (fs.existsSync(p)) {
				assert.deepEqual(loadJsonFile.sync(p), symbols);
			}
			writeJsonFile.sync(p.replace(/\.m$/, '.json'), symbols, { indent: '  ' });
		}
	});
});

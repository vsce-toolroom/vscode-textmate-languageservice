import * as vscode from 'vscode';
import * as path from 'path';
import * as glob from 'glob';
import * as fs from 'fs';
import * as assert from 'assert';
import { TextmateEngine } from '../src/textmateEngine';
import { DocumentSymbolProvider } from '../src/documentSymbolProvider';
import { WorkspaceDocumentProvider, WorkspaceSymbolProvider } from '../src/workspaceSymbolProvider';

const workspaceDocumentProvider = new WorkspaceDocumentProvider('matlab');
const engine = new TextmateEngine('matlab', 'source.matlab');
const documentSymbolProvider = new DocumentSymbolProvider(engine);
const workspaceSymbolProvider = new WorkspaceSymbolProvider('matlab', documentSymbolProvider);
const cancelToken = new vscode.CancellationTokenSource().token;

suite('src/foldingProvider.ts', function() {
	this.timeout(30000);
	test('WorkspaceDocumentProvider class', async function() {
		glob(path.resolve(__dirname, './test/vscode-matlab/syntaxes/MATLAB-Language-grammar/test/snap/*.m'), async function(e, files) {
			if (e) {
				throw e;
			}
			for (const file of files) {
				const resource = vscode.Uri.file(file);
				const textDocument = await vscode.workspace.openTextDocument(resource);
				const providerDocument = await workspaceDocumentProvider.getDocument(resource);
				assert.strictEqual(textDocument.uri.toString(), providerDocument.uri.toString());
				assert.strictEqual(textDocument.lineCount, providerDocument.lineCount);
				assert.strictEqual(textDocument.lineAt(0), providerDocument.lineAt(0));
			}
		});
	});
	test('WorkspaceSymbolProvider class', async function() {
		glob(path.resolve(__dirname, './test/vscode-matlab/syntaxes/MATLAB-Language-grammar/test/snap/*.m'), async function(e, files) {
			if (e) {
				throw e;
			}
			for (const file of files) {
				const resource = vscode.Uri.file(file);
				const textDocument = await vscode.workspace.openTextDocument(resource);
				const symbols = await workspaceSymbolProvider.provideWorkspaceSymbols('obj.');
				const p = path.resolve(__dirname, 'data/workspaceSymbolProvider', path.basename(file));
				if (process.env.UPDATE) {
					fs.writeFileSync(p, JSON.stringify(symbols, null, '  '));
				} else {
					assert.deepEqual(JSON.parse(fs.readFileSync(p).toString()), symbols);
				}
			}
		});
	});
});

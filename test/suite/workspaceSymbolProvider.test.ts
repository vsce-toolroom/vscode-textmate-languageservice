import vscode from 'vscode';
import path from 'path';
import glob from 'glob';
import fs from 'fs';
import deepEqual from 'deep-equal';
import assert from 'assert';
import writeJsonFile from 'write-json-file';
import loadJsonFile from 'load-json-file';
import { TextmateEngine } from '../../src/textmateEngine';
import { DocumentSymbolProvider } from '../../src/documentSymbolProvider';
import { WorkspaceDocumentProvider, WorkspaceSymbolProvider } from '../../src/workspaceSymbolProvider';
import replacer from './replacer';

const workspaceDocumentProvider = new WorkspaceDocumentProvider('matlab');
const engine = new TextmateEngine('matlab', 'source.matlab');
const documentSymbolProvider = new DocumentSymbolProvider(engine);
const workspaceSymbolProvider = new WorkspaceSymbolProvider('matlab', documentSymbolProvider);

suite('src/foldingProvider.ts', function() {
	this.timeout(30000);
	test('WorkspaceDocumentProvider class', async function() {
		const files = glob.sync(path.resolve(__dirname, '../../../../../syntaxes/MATLAB-Language-grammar/test/snap/*.m'));
		for (const file of files) {
			const resource = vscode.Uri.file(file);
			const textDocument = await vscode.workspace.openTextDocument(resource);
			const providerDocument = await workspaceDocumentProvider.getDocument(resource);
			assert.strictEqual(
				textDocument.uri.toString(),
				providerDocument.uri.toString(),
				`SkinnyTextDocument.uri: expected '${textDocument.uri.path}' but found '${providerDocument.uri.path}'.`
			);
			assert.strictEqual(
				textDocument.lineCount,
				providerDocument.lineCount,
				`SkinnyTextDocument.lineCount: expected ${textDocument.lineCount} lines but found ${providerDocument.lineCount} lines.`
			);
			assert.strictEqual(
				textDocument.lineAt(0).text,
				providerDocument.lineAt(0).text,
				`SkinnyTextDocument.lineAt(0): expected '${textDocument.lineAt(0).text}' but found '${providerDocument.lineAt(0).text}' lines.`
			);
		}
	});
	test('WorkspaceSymbolProvider class', async function() {
		const files = glob.sync(path.resolve(__dirname, '../../../../../syntaxes/MATLAB-Language-grammar/test/snap/*.m'));
		for (const file of files) {
			const resource = vscode.Uri.file(file);
			await vscode.workspace.openTextDocument(resource);
			const symbols = await workspaceSymbolProvider.provideWorkspaceSymbols('obj.');
			const p = path
				.resolve(__dirname, '../data/workspaceSymbolProvider', path.basename(file))
				.replace(/\.m$/, '.json');

			if (fs.existsSync(p)) {
				deepEqual(loadJsonFile.sync(p), symbols);
			}
			writeJsonFile.sync(p, symbols, { indent: '  ', replacer: replacer });
		}
	});
});

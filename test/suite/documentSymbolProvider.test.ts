import vscode from 'vscode';
import path from 'path';
import glob from 'glob';
import fs from 'fs';
import deepEqual from 'deep-equal';
import writeJsonFile from 'write-json-file';
import loadJsonFile from 'load-json-file';
import { TextmateEngine } from '../../src/textmateEngine';
import { WorkspaceDocumentProvider } from '../../src/workspaceSymbolProvider';
import { DocumentSymbolProvider } from '../../src/documentSymbolProvider';
import replacer from './replacer';

const engine = new TextmateEngine('matlab', 'source.matlab');
const documentSymbolProvider = new DocumentSymbolProvider(engine);
const workspaceDocumentProvider = new WorkspaceDocumentProvider('matlab');

suite('src/tableOfContentsProvider.ts', function() {
	this.timeout(0);
	test('DocumentSymbolProvider class', async function() {
		const files = glob.sync(path.resolve(__dirname, '../../../../../syntaxes/MATLAB-Language-grammar/test/snap/*.m'));
		for (const file of files) {
			const resource = vscode.Uri.file(file);
			const document = await workspaceDocumentProvider.getDocument(resource);

			const p = path
				.resolve(__dirname, '../data/documentSymbolProvider', path.basename(file))
				.replace(/\.m$/, '.json');
			const symbols = await documentSymbolProvider.provideDocumentSymbols(document);

			writeJsonFile.sync(p, symbols, { indent: '  ' });
			if (fs.existsSync(p)) {
				deepEqual(loadJsonFile.sync(p), symbols);
			}
		}
	});
});

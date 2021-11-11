import * as vscode from 'vscode';
import * as path from 'path';
import * as glob from 'glob';
import * as fs from 'fs';
import * as assert from 'assert';
import * as writeJsonFile from 'write-json-file';
import * as loadJsonFile from 'load-json-file';
import { TextmateEngine } from '../../src/textmateEngine';
import { WorkspaceDocumentProvider } from '../../src/workspaceSymbolProvider';
import { DocumentSymbolProvider } from '../../src/documentSymbolProvider';

const engine = new TextmateEngine('matlab', 'source.matlab');
const documentSymbolProvider = new DocumentSymbolProvider(engine);
const workspaceDocumentProvider = new WorkspaceDocumentProvider('matlab');

suite('src/tableOfContentsProvider.ts', function() {
	this.timeout(30000);
	test('DocumentSymbolProvider class', async function() {
		const files = glob.sync(path.resolve(__dirname, '../../../../../syntaxes/MATLAB-Language-grammar/test/snap/*.m'));
		for (const file of files) {
			const resource = vscode.Uri.file(file);
			const document = await workspaceDocumentProvider.getDocument(resource);
			const p = path.resolve(__dirname, '../data/documentSymbolProvider', path.basename(file));
			const symbols = await documentSymbolProvider.provideDocumentSymbols(document);
			if (fs.existsSync(p)) {
				assert.deepEqual(loadJsonFile.sync(p), symbols);
			}
			writeJsonFile.sync(p, symbols, { indent: '  ' });
		}
	});
});

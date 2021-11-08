import * as vscode from 'vscode';
import * as path from 'path';
import * as glob from 'glob';
import * as fs from 'fs';
import * as assert from 'assert';
import { TextmateEngine } from '../src/textmateEngine';
import { WorkspaceDocumentProvider } from '../src/workspaceSymbolProvider';
import { DocumentSymbolProvider } from '../src/documentSymbolProvider';

const engine = new TextmateEngine('matlab', 'source.matlab');
const documentSymbolProvider = new DocumentSymbolProvider(engine);
const workspaceDocumentProvider = new WorkspaceDocumentProvider('matlab');

suite('src/tableOfContentsProvider.ts', function() {
	this.timeout(30000);
	test('DocumentSymbolProvider class', async function() {
		glob(path.resolve(__dirname, './test/vscode-matlab/syntaxes/MATLAB-Language-grammar/test/snap/*.m'), async function(e, files) {
			if (e) {
				throw e;
			}
			for (const file of files) {
				const resource = vscode.Uri.file(file);
				const document = await workspaceDocumentProvider.getDocument(resource);
				const p = path.resolve(__dirname, 'data/documentSymbolProvider', path.basename(file));
				const symbols = await documentSymbolProvider.provideDocumentSymbols(document);
				if (process.env.UPDATE) {
					fs.writeFileSync(p, JSON.stringify(symbols, null, '  '));
				} else {
					assert.deepEqual(JSON.parse(fs.readFileSync(p).toString()), symbols);
				}
			}
		});
	});
});

import vscode from 'vscode';
import path from 'path';
import glob from 'glob';
import fs from 'fs';
import assert from 'assert';
import deepEqual from 'deep-equal';
import writeJsonFile from 'write-json-file';
import loadJsonFile from 'load-json-file';
import { TextmateEngine } from '../../src/textmateEngine';
import { WorkspaceDocumentProvider } from '../../src/workspaceSymbolProvider';
import { DocumentSymbolProvider } from '../../src/documentSymbolProvider';
import jsonify from './jsonify';

const engine = new TextmateEngine('matlab', 'source.matlab');
const documentSymbolProvider = new DocumentSymbolProvider(engine);
const workspaceDocumentProvider = new WorkspaceDocumentProvider('matlab');

suite('src/documentSymbolProvider.ts', function() {
	this.timeout(60000);
	test('DocumentSymbolProvider class', async function() {
		const files = glob.sync(path.resolve(__dirname, '../../../../../../animals/*.m'));
		for (const file of files) {
			const resource = vscode.Uri.file(file);
			const document = await workspaceDocumentProvider.getDocument(resource);

			const p = path
				.resolve(__dirname, '../data/documentSymbolProvider', path.basename(file))
				.replace(/\.m$/, '.json');
			const symbols = jsonify(await documentSymbolProvider.provideDocumentSymbols(document));

			if (fs.existsSync(p)) {
				assert.strictEqual(deepEqual(loadJsonFile.sync(p), symbols), true);
			}
			writeJsonFile.sync(p, symbols, { indent: '  ' });
		}
	});
});

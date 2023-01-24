'use strict';

import * as vscode from 'vscode';
import * as path from 'path';
import * as glob from 'glob';
import * as fs from 'fs';
import * as assert from 'assert';
import deepEqual = require('deep-equal');
import * as writeJsonFile from 'write-json-file';
import * as loadJsonFile from 'load-json-file';

import lsp from '../util/lsp';
import jsonify from '../util/jsonify';
import type { JsonArray } from 'type-fest';

suite('src/document.ts', function() {
	this.timeout(20000);
	test('DocumentSymbolProvider class', async function() {
		const workspaceDocumentService = await lsp.createWorkspaceDocumentService();
		const documentSymbolProvider = await lsp.createDocumentSymbolProvider();

		const files = glob.sync(path.resolve(__dirname, '../../../../../../animals/*.m'));

		for (const file of files) {
			const resource = vscode.Uri.file(file);
			const document = await workspaceDocumentService.getDocument(resource);

			const p = path.resolve(__dirname, '../data/document', path.basename(file)).replace(/\.m$/, '.json');
			const symbols = jsonify<JsonArray>(await documentSymbolProvider.provideDocumentSymbols(document));

			if (fs.existsSync(p)) {
				assert.strictEqual(deepEqual(symbols, loadJsonFile.sync(p)), true, p);
			}
			writeJsonFile.sync(p, symbols, { indent: '  ' });
		}
	});
});

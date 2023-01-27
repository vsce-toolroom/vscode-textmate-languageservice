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

suite('src/document-symbol.ts (test/suite/document-symbol.ts)', function() {
	this.timeout(10000);
	test('TextmateDocumentSymbolProvider class', async function() {
		vscode.window.showInformationMessage('TextmateDocumentSymbolProvider class (src/document-symbol.ts)');

		const workspaceDocumentService = await lsp.initWorkspaceDocumentService();
		const documentSymbolProvider = await lsp.createDocumentSymbolProvider();

		const files = glob.sync(path.resolve(__dirname, '../../../../../samples/*.m'));

		for (const file of files) {
			const resource = vscode.Uri.file(file);
			const document = await workspaceDocumentService.getDocument(resource);

			const p = path.resolve(__dirname, '../../../../../data/document-symbol', path.basename(file)).replace(/\.m$/, '.json');
			const symbols = jsonify<JsonArray>(await documentSymbolProvider.provideDocumentSymbols(document));

			if (fs.existsSync(p)) {
				assert.strictEqual(deepEqual(symbols, loadJsonFile.sync(p)), true, p);
			}
			writeJsonFile.sync(p, symbols, { indent: '  ' });
		}
	});
});

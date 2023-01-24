'use strict';

import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import * as glob from 'glob';
import * as assert from 'assert';
import deepEqual = require('deep-equal');
import * as writeJsonFile from 'write-json-file';
import * as loadJsonFile from 'load-json-file';

import lsp from '../../util/lsp';
import jsonify from '../../util/jsonify';
import type { JsonArray } from 'type-fest';

suite('src/services/tokenizer.ts', async function() {
	this.timeout(20000);
	test('TextmateTokenizerService class', async function() {
		const workspaceDocumentService = await lsp.createWorkspaceDocumentService();

		const files = glob.sync(path.resolve(__dirname, '../../../../../../../animals/*.m'));

		for (const file of files) {
			const resource = vscode.Uri.file(file);

			const document = await workspaceDocumentService.getDocument(resource);
			const tokens = jsonify<JsonArray>(await lsp.tokenizer.tokenize(document));

			const p = path.resolve(__dirname, '../data/tokenizer', path.basename(file)).replace(/\.m$/, '.json');

			if (fs.existsSync(p)) {
				assert.strictEqual(deepEqual(tokens, loadJsonFile.sync(p)), true, p);
			}
			writeJsonFile.sync(p, tokens, { indent: '  ' });
		}
	});
});

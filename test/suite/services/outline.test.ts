'use strict';

import * as vscode from 'vscode';
import * as path from 'path';
import * as glob from 'glob';
import * as fs from 'fs';
import * as assert from 'assert';
import deepEqual = require('deep-equal');
import * as writeJsonFile from 'write-json-file';
import * as loadJsonFile from 'load-json-file';

import lsp from '../../util/lsp';
import jsonify from '../../util/jsonify';
import type { JsonArray } from 'type-fest';

suite('src/services/outline.ts', function() {
	this.timeout(20000);
	test('OutlineGenerator class', async function() {
		const workspaceDocumentService = await lsp.createWorkspaceDocumentService();
		const outlineGeneratorService = await lsp.createOutlineGeneratorService();

		const files = glob.sync(path.resolve(__dirname, '../../../../../../animals/*.m'));

		for (const file of files) {
			const resource = vscode.Uri.file(file);

			const document = await workspaceDocumentService.getDocument(resource);
			const outline = jsonify<JsonArray>(await outlineGeneratorService.getOutline(document));

			const p = path.resolve(__dirname, '../data/tableofContentsProvider', path.basename(file)).replace(/\.m$/, '.json');

			if (fs.existsSync(p)) {
				assert.strictEqual(deepEqual(outline, loadJsonFile.sync(p)), true, p);
			}
			writeJsonFile.sync(p, outline, { indent: '  ' });
		}
	});
});

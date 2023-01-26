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
	this.timeout(10000);
	test('DocumentOutlineService class', async function() {
		vscode.window.showInformationMessage('DocumentOutlineService class (src/services/outline.ts)');

		const workspaceDocumentService = await lsp.initWorkspaceDocumentService();
		const documentOutlineService = await lsp.initDocumentOutlineService();

		const files = glob.sync(path.resolve(__dirname, '../../../../../../samples/*.m'));

		for (const file of files) {
			const resource = vscode.Uri.file(file);

			const document = await workspaceDocumentService.getDocument(resource);
			const outline = jsonify<JsonArray>(await documentOutlineService.fetch(document));

			const p = path.resolve(__dirname, '../../../../../../data/outline', path.basename(file)).replace(/\.m$/, '.json');

			if (fs.existsSync(p)) {
				assert.strictEqual(deepEqual(outline, loadJsonFile.sync(p)), true, p);
			}
			writeJsonFile.sync(p, outline, { indent: '  ' });
		}
	});
});

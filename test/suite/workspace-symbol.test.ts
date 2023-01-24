'use strict';

import * as path from 'path';
import * as fs from 'fs';
import * as assert from 'assert';
import deepEqual = require('deep-equal');
import * as writeJsonFile from 'write-json-file';
import * as loadJsonFile from 'load-json-file';

import lsp from '../util/lsp';
import jsonify from '../util/jsonify';
import type { JsonArray } from 'type-fest';

suite('src/workspace-symbol.ts', function() {
	this.timeout(20000);
	test('WorkspaceSymbolProvider class', async function() {
		const workspaceSymbolProvider = await lsp.createWorkspaceSymbolProvider();
		const symbols = jsonify<JsonArray>(await workspaceSymbolProvider.provideWorkspaceSymbols('obj.'));
		const p = path.resolve(__dirname, '../data/workspaceSymbolProvider', 'index.json');

		if (fs.existsSync(p)) {
			assert.strictEqual(deepEqual(symbols, loadJsonFile.sync(p)), true, p);
		}
		writeJsonFile.sync(p, symbols, { indent: '  ' });
	});
});

'use strict';

import * as vscode from 'vscode';

import lsp from '../util/lsp';
import jsonify from '../util/jsonify';
import tester from '../util/tester';
import type { JsonArray } from 'type-fest';

const workspaceSymbolProviderPromise = lsp.createWorkspaceSymbolProvider();

suite('src/workspace-symbol.ts (test/suite/workspace-symbol.test.ts)', async function() {
	this.timeout(10000);

	test('TextmateWorkspaceSymbolProvider class', async function() {
		vscode.window.showInformationMessage('TextmateTokenizerService class (src/parser/selectors.ts)');

		const workspaceSymbolProvider = await workspaceSymbolProviderPromise;
		const symbols = jsonify<JsonArray>(await workspaceSymbolProvider.provideWorkspaceSymbols('obj.'));

		await tester('workspace-symbol', 'index', symbols);
	});
});

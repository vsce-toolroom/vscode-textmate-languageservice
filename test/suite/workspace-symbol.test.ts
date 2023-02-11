'use strict';

import * as vscode from 'vscode';

import { context, workspaceSymbolProviderPromise } from '../util/factory';
import { sampler } from '../util/sampler';

suite('src/workspace-symbol.ts', function() {
	test('TextmateWorkspaceSymbolProvider class', async function() {
		this.timeout(10000);
		vscode.window.showInformationMessage('TextmateWorkspaceSymbolProvider class (src/workspace-symbol.ts)');

		const workspaceSymbolProvider = await workspaceSymbolProviderPromise;
		const symbols = await workspaceSymbolProvider.provideWorkspaceSymbols('obj.');

		test('provideWorkspaceSymbols(): Promise<vscode.SymbolInformation[]>', async function() {
			await sampler.call(context, 'workspace-symbol', 'index', symbols);
		});
	});
});

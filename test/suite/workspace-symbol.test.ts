'use strict';

import * as vscode from 'vscode';
import { describe, test } from '@jest/globals';

import { context, workspaceSymbolProviderPromise } from '../util/factory';
import { sampler } from '../util/sampler';

describe('src/workspace-symbol.ts', function() {
	test('TextmateWorkspaceSymbolProvider class', async function() {
		vscode.window.showInformationMessage('TextmateWorkspaceSymbolProvider class (src/workspace-symbol.ts)');

		const workspaceSymbolProvider = await workspaceSymbolProviderPromise;
		const symbols = await workspaceSymbolProvider.provideWorkspaceSymbols('obj.');

		test('provideWorkspaceSymbols(): Promise<vscode.SymbolInformation[]>', async function() {
			await sampler.call(context, 'workspace-symbol', 'index', symbols);
		});
	}, 10000);
});

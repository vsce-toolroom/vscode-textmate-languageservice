'use strict';

import * as vscode from 'vscode';
import * as Mocha from 'mocha';

import { setupEnvironmentForLanguageId } from './context';
import { getTestModeExtension } from './util/common';

const files = [
	require.resolve('./suite/services/selectors.test'),
	require.resolve('./suite/services/tokenizer.test'),
	require.resolve('./suite/services/outline.test'),
	require.resolve('./suite/services/document.test'),
	require.resolve('./suite/providers/folding.test'),
	require.resolve('./suite/providers/definition.test'),
	require.resolve('./suite/providers/document-symbol.test'),
	require.resolve('./suite/providers/workspace-symbol.test'),
	require.resolve('./suite/api/window.test')
];

export async function run(): Promise<void> {
	vscode.window.showInformationMessage('Start all tests.');

	const mocha = new Mocha({ ui: 'tdd', reporter: 'spec' });

	const languageId = getTestModeExtension().id.split('.')[1];
	setupEnvironmentForLanguageId(languageId);

	await vscode.commands.executeCommand('workbench.action.files.newUntitledFile');
	vscode.languages.setTextDocumentLanguage(vscode.window!.activeTextEditor!.document, languageId);
	await vscode.commands.executeCommand('workbench.action.closeActiveEditor');

	return new Promise((c, x) => {
		files.forEach(f => mocha.addFile(f));

		try {
			mocha.run(function(failures) {
				if (failures > 0) {
					x(new Error(`${failures} tests failed.`));
				} else {
					c();
				}
			});
		} catch (e) {
			console.error(e);
			x(e);
		}
	});
}

function getDevelopmentModeLanguageName() {
	return getTestModeExtension().id.split('.')[1];
}

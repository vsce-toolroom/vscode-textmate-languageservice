'use strict';

import * as vscode from 'vscode';

import { setupEnvironmentForLanguageId } from './context';

import { getTestModeExtension } from './util/common';

// import mocha for the browser, defining the `mocha` global
import 'mocha/mocha';

export async function run(): Promise<void> {
	vscode.window.showInformationMessage('Start all tests.');

	const languageId = getTestModeExtension().id.split('.')[1];
	setupEnvironmentForLanguageId(languageId);

	await vscode.commands.executeCommand('workbench.action.files.newUntitledFile');
	vscode.languages.setTextDocumentLanguage(vscode.window!.activeTextEditor!.document, languageId);
	await vscode.commands.executeCommand('workbench.action.closeActiveEditor');

	return new Promise((c, x) => {
		mocha.setup({ ui: 'tdd', reporter: void 0 });

		// import mocha test files, so that webpack can inline them
		import('./suite/services/selectors.test');
		import('./suite/services/tokenizer.test');
		import('./suite/services/outline.test');
		import('./suite/services/document.test');
		import('./suite/providers/folding.test');
		import('./suite/providers/definition.test');
		import('./suite/providers/document-symbol.test');
		import('./suite/providers/workspace-symbol.test');
		import('./suite/api/token-information.test');
		import('./suite/api/language-contribution.test');

		try {
			// Run the mocha test
			mocha.run(failures => {
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

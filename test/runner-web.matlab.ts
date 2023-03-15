'use strict';

import * as vscode from 'vscode';

// import mocha for the browser, defining the `mocha` global
import 'mocha/mocha';

export async function run(): Promise<void> {
	vscode.window.showInformationMessage('Start all tests.');

	await vscode.commands.executeCommand('workbench.action.files.newUntitledFile');
	vscode.languages.setTextDocumentLanguage(vscode.window!.activeTextEditor!.document, 'matlab');
	await vscode.commands.executeCommand('workbench.action.closeActiveEditor');

	return new Promise((c, x) => {
		mocha.setup({ ui: 'tdd', reporter: void 0 });

		// import mocha test files, so that webpack can inline them
		import('./suite/selectors.test');
		import('./suite/tokenizer.test');
		import('./suite/outline.test');
		import('./suite/document.test');
		import('./suite/folding.test');
		import('./suite/definition.test');
		import('./suite/document-symbol.test');
		import('./suite/workspace-symbol.test');

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

'use strict';

import * as vscode from 'vscode';

// import mocha for the browser, defining the `mocha` global
import 'mocha/mocha';
import { BASE_CLASS_NAME, getSampleFileUri } from './util/files';
import { extensionContext } from './util/factory';

export async function run(): Promise<void> {
	vscode.window.showInformationMessage('Start all tests.');

	const resource = getSampleFileUri.call(extensionContext, BASE_CLASS_NAME);
	const document = await vscode.workspace.openTextDocument(resource);
	await vscode.window.showTextDocument(document);
	await vscode.commands.executeCommand('workbench.action.closeActiveEditor');

	return new Promise((c, x) => {
		mocha.setup({ ui: 'tdd', reporter: void 0 });

		// import mocha test files, so that webpack can inline them
		import('./suite/selectors.util.test');
		import('./suite/tokenizer.service.test');
		import('./suite/outline.service.test');
		import('./suite/document.service.test');
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

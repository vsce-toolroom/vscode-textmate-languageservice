'use strict';

import * as vscode from 'vscode';

// import mocha for the browser, defining the `mocha` global
import 'mocha/mocha';

// import mocha test files, so that webpack can inline them
import './suite/selectors.util.test';
import './suite/tokenizer.service.test';
import './suite/outline.service.test';
import './suite/document.service.test';
import './suite/folding.test';
import './suite/definition.test';
import './suite/document-symbol.test';
import './suite/workspace-symbol.test';

export function run(): Promise<void> {
	vscode.window.showInformationMessage('Start all tests.');

	return new Promise((c, e) => {
		mocha.setup({ ui: 'tdd', reporter: void 0 });

		try {
			// Run the mocha test
			mocha.run(failures => {
				if (failures > 0) {
					e(new Error(`${failures} tests failed.`));
				} else {
					c();
				}
			});
		} catch (e) {
			console.error(e);
			e(e);
		}
	});
}

run();

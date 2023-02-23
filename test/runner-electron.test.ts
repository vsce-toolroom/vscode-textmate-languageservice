import * as vscode from 'vscode';
import * as Mocha from 'mocha';

import { extensionContext } from './util/factory';
import { BASE_CLASS_NAME, getSampleFileUri } from './util/files';

const files = [
	require.resolve('./suite/selectors.util.test'),
	require.resolve('./suite/tokenizer.service.test'),
	require.resolve('./suite/outline.service.test'),
	require.resolve('./suite/document.service.test'),
	require.resolve('./suite/folding.test'),
	require.resolve('./suite/definition.test'),
	require.resolve('./suite/document-symbol.test'),
	require.resolve('./suite/workspace-symbol.test')
];

export async function run(): Promise<void> {
	const mocha = new Mocha({ ui: 'tdd', reporter: 'spec' });

	const resource = getSampleFileUri.call(extensionContext, BASE_CLASS_NAME);
	const document = await vscode.workspace.openTextDocument(resource);
	await vscode.window.showTextDocument(document);
	await vscode.commands.executeCommand('workbench.action.closeActiveEditor');

	return new Promise((c, x) => {
		files.forEach(f => mocha.addFile(f));

		try {
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

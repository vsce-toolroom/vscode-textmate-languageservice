import * as vscode from 'vscode';
import * as Mocha from 'mocha';

const files = [
	require.resolve('./suite/selectors.test'),
	require.resolve('./suite/tokenizer.test'),
	require.resolve('./suite/outline.test'),
	require.resolve('./suite/document.test'),
	require.resolve('./suite/folding.test'),
	require.resolve('./suite/definition.test'),
	require.resolve('./suite/document-symbol.test'),
	require.resolve('./suite/workspace-symbol.test')
];

export async function run(): Promise<void> {
	vscode.window.showInformationMessage('Start all tests.');

	const mocha = new Mocha({ ui: 'tdd', reporter: 'spec' });

	await vscode.commands.executeCommand('workbench.action.files.newUntitledFile');
	vscode.languages.setTextDocumentLanguage(vscode.window!.activeTextEditor!.document, 'matlab');
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

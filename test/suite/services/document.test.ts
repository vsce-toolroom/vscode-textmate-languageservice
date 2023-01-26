'use strict';

import * as vscode from 'vscode';
import * as path from 'path';
import * as glob from 'glob';
import * as assert from 'assert';

import lsp from '../../util/lsp';

suite('src/services/document.ts', function() {
	this.timeout(10000);
	test('WorkspaceDocumentService class', async function() {
		vscode.window.showInformationMessage('WorkspaceDocumentService class (src/services/document.ts)');

		const workspaceDocumentService = await lsp.initWorkspaceDocumentService();
		const files = glob.sync(path.resolve(__dirname, '../../../../../../samples/*.m'));

		for (const file of files) {
			const resource = vscode.Uri.file(file);
			const document = await vscode.workspace.openTextDocument(resource);

			const providerDocument = await workspaceDocumentService.getDocument(resource);

			assert.strictEqual(
				document.uri.toString(),
				providerDocument.uri.toString(),
				`SkinnyTextDocument.uri: expected '${document.uri.path}' but found '${providerDocument.uri.path}'.`
			);
			assert.strictEqual(
				document.lineCount,
				providerDocument.lineCount,
				`SkinnyTextDocument.lineCount: expected ${document.lineCount} lines but found ${providerDocument.lineCount} lines.`
			);
			assert.strictEqual(
				document.lineAt(0).text,
				providerDocument.lineAt(0).text,
				`SkinnyTextDocument.lineAt(0): expected line 0 to be "'${document.lineAt(0).text}'" but found "'${providerDocument.lineAt(0).text}'".`
			);
		}

		await vscode.commands.executeCommand('workbench.action.closeAllEditors');
	});
});

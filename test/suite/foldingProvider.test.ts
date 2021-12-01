import vscode from 'vscode';
import path from 'path';
import glob from 'glob';
import fs from 'fs';
import assert from 'assert';
import deepEqual from 'deep-equal';
import writeJsonFile from 'write-json-file';
import loadJsonFile from 'load-json-file';
import { TextmateEngine } from '../../src/textmateEngine';
import { FoldingProvider } from '../../src/foldingProvider';
import jsonify from './jsonify';

const engine = new TextmateEngine('matlab', 'source.matlab');
const foldingProvider = new FoldingProvider(engine);
const foldingContext = {};
const cancelToken = new vscode.CancellationTokenSource().token;

suite('src/foldingProvider.ts', function() {
	this.timeout(60000);
	test('FoldingProvider class', async function() {
		const files = glob.sync(path.resolve(__dirname, '../../../../../../animals/*.m'));

		for (const file of files) {
			const resource = vscode.Uri.file(file);
			const document = await vscode.workspace.openTextDocument(resource);
			await vscode.window.showTextDocument(document);

			const p = path
				.resolve(__dirname, '../data/foldingProvider', path.basename(file))
				.replace(/\.m$/, '.json');
			const folds = jsonify(await foldingProvider.provideFoldingRanges(document, foldingContext, cancelToken));

			if (fs.existsSync(p)) {
				assert.strictEqual(deepEqual(loadJsonFile.sync(p), folds), true);
			}
			writeJsonFile.sync(p, folds, { indent: '  ' });
		}

		vscode.commands.executeCommand('workbench.action.closeAllEditors');
	});
});

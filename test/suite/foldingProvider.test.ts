import vscode from 'vscode';
import path from 'path';
import glob from 'glob';
import fs from 'fs';
import deepEqual from 'deep-equal';
import writeJsonFile from 'write-json-file';
import loadJsonFile from 'load-json-file';
import { TextmateEngine } from '../../src/textmateEngine';
import { FoldingProvider } from '../../src/foldingProvider';
import replacer from './replacer';

const engine = new TextmateEngine('matlab', 'source.matlab');
const foldingProvider = new FoldingProvider(engine);
const foldingContext = {};
const cancelToken = new vscode.CancellationTokenSource().token;

suite('src/foldingProvider.ts', function() {
	this.timeout(60000);
	test('DocumentSymbolProvider class', async function() {
		const files = glob.sync(path.resolve(__dirname, '../../../../../syntaxes/MATLAB-Language-grammar/test/snap/*.m'));
		for (const file of files) {
			const resource = vscode.Uri.file(file);
			const document = await vscode.workspace.openTextDocument(resource);

			const p = path
				.resolve(__dirname, '../data/foldingProvider', path.basename(file))
				.replace(/\.m$/, '.json');
			const folds = await foldingProvider.provideFoldingRanges(document, foldingContext, cancelToken);

			writeJsonFile.sync(p, folds, { indent: '  ' });
			if (fs.existsSync(p)) {
				deepEqual(loadJsonFile.sync(p), folds);
			}
		}
	});
});

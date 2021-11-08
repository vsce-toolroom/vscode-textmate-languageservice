import * as vscode from 'vscode';
import * as path from 'path';
import * as glob from 'glob';
import * as fs from 'fs';
import * as assert from 'assert';
import { TextmateEngine } from '../src/textmateEngine';
import { FoldingProvider } from '../src/foldingProvider';

const engine = new TextmateEngine('matlab', 'source.matlab');
const foldingProvider = new FoldingProvider(engine);
const foldingContext = {};
const cancelToken = new vscode.CancellationTokenSource().token;

suite('src/foldingProvider.ts', function() {
	this.timeout(30000);
	test('DocumentSymbolProvider class', async function() {
		glob(path.resolve(__dirname, './test/vscode-matlab/syntaxes/MATLAB-Language-grammar/test/snap/*.m'), async function(e, files) {
			if (e) {
				throw e;
			}
			for (const file of files) {
				const resource = vscode.Uri.file(file);
				const document = await vscode.workspace.openTextDocument(resource);
				const p = path.resolve(__dirname, 'data/foldingProvider', path.basename(file));
				const folds = await foldingProvider.provideFoldingRanges(document, foldingContext, cancelToken);
				if (process.env.UPDATE) {
					fs.writeFileSync(p, JSON.stringify(folds, null, '  '));
				} else {
					assert.deepEqual(JSON.parse(fs.readFileSync(p).toString()), folds);
				}
			}
		});
	});
});

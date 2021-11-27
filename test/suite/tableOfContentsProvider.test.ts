import vscode from 'vscode';
import path from 'path';
import glob from 'glob';
import fs from 'fs';
import deepEqual from 'deep-equal';
import writeJsonFile from 'write-json-file';
import loadJsonFile from 'load-json-file';
import { TextmateEngine } from '../../src/textmateEngine';
import { WorkspaceDocumentProvider } from '../../src/workspaceSymbolProvider';
import { TableOfContentsProvider } from '../../src/tableOfContentsProvider';
import replacer from './replacer';

const engine = new TextmateEngine('matlab', 'source.matlab');
const tableOfContentsProvider = new TableOfContentsProvider(engine);
const workspaceDocumentProvider = new WorkspaceDocumentProvider('matlab');

suite('src/tableOfContentsProvider.ts', function() {
	this.timeout(30000);
	test('TableOfContentsProvider class', async function() {
		const files = glob.sync(path.resolve(__dirname, '../../../../../syntaxes/MATLAB-Language-grammar/test/snap/*.m'));
		for (const file of files) {
			const resource = vscode.Uri.file(file);
			const document = await workspaceDocumentProvider.getDocument(resource);
			const p = path
				.resolve(__dirname, '../data/tableOfContentsProvider', path.basename(file))
				.replace(/\.m$/, '.json');
			const toc = await tableOfContentsProvider.getToc(document);

			if (fs.existsSync(p)) {
				deepEqual(loadJsonFile.sync(p), toc);
			}
			writeJsonFile.sync(p, toc, { indent: '  ', replacer: replacer });
		}
	});
});

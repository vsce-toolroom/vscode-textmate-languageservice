import vscode from 'vscode';
import path from 'path';
import glob from 'glob';
import fs from 'fs';
import assert from 'assert';
import deepEqual from 'deep-equal';
import writeJsonFile from 'write-json-file';
import loadJsonFile from 'load-json-file';
import { TextmateEngine } from '../../src/textmateEngine';
import { WorkspaceDocumentProvider } from '../../src/workspaceSymbolProvider';
import { TableOfContentsProvider, TocEntry } from '../../src/tableOfContentsProvider';
import jsonify from './jsonify';

const engine = new TextmateEngine('matlab', 'source.matlab');
const tableOfContentsProvider = new TableOfContentsProvider(engine);
const workspaceDocumentProvider = new WorkspaceDocumentProvider('matlab');

type Mutable<T> = {
	-readonly[P in keyof T]: T[P]
};

suite('src/tableOfContentsProvider.ts', function() {
	this.timeout(60000);
	test('TableOfContentsProvider class', async function() {
		const files = glob.sync(path.resolve(__dirname, '../../../../../../animals/*.m'));
		for (const file of files) {
			const resource = vscode.Uri.file(file);

			const document = await workspaceDocumentProvider.getDocument(resource);
			const toc = jsonify(await tableOfContentsProvider.getToc(document));

			for (const entry of toc) {
				if (entry?.location?.uri) {
					(entry as Mutable<TocEntry>).location.uri = entry.location.uri.path as any;
				}
			}

			const p = path
				.resolve(__dirname, '../data/tableOfContentsProvider', path.basename(file))
				.replace(/\.m$/, '.json');

			if (fs.existsSync(p)) {
				assert.strictEqual(deepEqual(loadJsonFile.sync(p), toc), true);
			}
			writeJsonFile.sync(p, toc, { indent: '  ' });
		}
	});
});

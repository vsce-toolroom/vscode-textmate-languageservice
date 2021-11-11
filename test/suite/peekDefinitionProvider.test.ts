import * as vscode from 'vscode';
import * as path from 'path';
import * as glob from 'glob';
import * as fs from 'fs';
import * as assert from 'assert';
import * as writeJsonFile from 'write-json-file';
import * as loadJsonFile from 'load-json-file';
import { TextmateEngine } from '../../src/textmateEngine';
import { DocumentSymbolProvider } from '../../src/documentSymbolProvider';
import { WorkspaceDocumentProvider } from '../../src/workspaceSymbolProvider';
import { PeekDefinitionProvider } from '../../src/peekDefinitionProvider';
import { TableOfContentsProvider } from '../../src/tableOfContentsProvider';

const engine = new TextmateEngine('matlab', 'source.matlab');
const tableOfContentsProvider = new TableOfContentsProvider(engine);
const documentSymbolProvider = new DocumentSymbolProvider(engine);
const workspaceDocumentProvider = new WorkspaceDocumentProvider('matlab');
const peekDefinitionProvider = new PeekDefinitionProvider(documentSymbolProvider);

suite('src/tableOfContentsProvider.ts', function() {
	this.timeout(30000);
	test('PeekDefinitionProvider class', async function() {
		glob(path.resolve(__dirname, '../../../../../syntaxes/MATLAB-Language-grammar/test/snap/*.m'), async function(e, files) {
			if (e) {
				throw e;
			}
			for (const file of files) {
				const resource = vscode.Uri.file(file);
				const document = await vscode.workspace.openTextDocument(resource);
				await vscode.window.showTextDocument(document);
				const skinnyDocument = await workspaceDocumentProvider.getDocument(resource);
				const toc = await tableOfContentsProvider.getToc(skinnyDocument);
				const definitions = [];
				toc.forEach(async function(entry) {
					const references = await peekDefinitionProvider.provideDefinition(
						document,
						entry.location.range.start
					);
					definitions.push({
						text: entry.text,
						token: entry.token,
						definition: entry.location,
						references: references.map(function(ref) {
							return {
								title: path.basename(ref.uri.path),
								location: {
									end: {
										character: ref.range.end.character,
										line: ref.range.end.line
									},
									start: {
										character: ref.range.start.character,
										line: ref.range.start.line
									}
								}
							}
						})
					});
				});
				const p = path.resolve(__dirname, '../data/peekDefinitionProvider', path.basename(file));
				if (fs.existsSync(p)) {
					assert.deepEqual(loadJsonFile.sync(p), definitions);
				}
				writeJsonFile.sync(p, definitions, { indent: '  ' });
			}
		});
	});
});

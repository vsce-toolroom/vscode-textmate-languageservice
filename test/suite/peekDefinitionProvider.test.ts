import vscode from 'vscode';
import path from 'path';
import glob from 'glob';
import fs from 'fs';
import deepEqual from 'deep-equal';
import writeJsonFile from 'write-json-file';
import loadJsonFile from 'load-json-file';
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
		const files = glob.sync(path.resolve(__dirname, '../../../../../syntaxes/MATLAB-Language-grammar/test/snap/*.m'));
		for (const file of files) {
			const resource = vscode.Uri.file(file);
			const document = await vscode.workspace.openTextDocument(resource);
			const textEditor = await vscode.window.showTextDocument(document);
			const skinnyDocument = await workspaceDocumentProvider.getDocument(resource);
			const toc = await tableOfContentsProvider.getToc(skinnyDocument);
			const definitions = [];
			toc.forEach(async function(entry) {
				textEditor.selection = new vscode.Selection(entry.location.range.start, entry.location.range.end);
				vscode.commands.executeCommand('cursorWordStartRightSelect');
				const references = await peekDefinitionProvider.provideDefinition(
					document,
					entry.location.range.start
				);
				if (Array.isArray(references)) {
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
				}
			});
			const p = path
				.resolve(__dirname, '../data/peekDefinitionProvider', path.basename(file))
				.replace(/\.m$/, '.json');
			if (fs.existsSync(p)) {
				deepEqual(loadJsonFile.sync(p), definitions);
			}
			writeJsonFile.sync(p, definitions, { indent: '  ' });
		}
	});
});

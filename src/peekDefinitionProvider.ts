'use strict';

import vscode from 'vscode';
import { configurationData } from './textmateEngine';
import { DocumentSymbolProvider } from './documentSymbolProvider';

const extensions = configurationData.language.extensions.length === 1
	? `.{${configurationData.language.extensions.map((e: string) => e.substring(1)).join(',')}}`
	: configurationData.language.extensions[0];

export class PeekDefinitionProvider implements vscode.DefinitionProvider {
	constructor(
		private _symbolProvider: DocumentSymbolProvider
	) {}

	getComponentName(position: vscode.Position): String[] {
		const doc = vscode.window.activeTextEditor.document;
		const selection = doc.getWordRangeAtPosition(position);
		const selectedText = doc.getText(selection);
		let possibleFileNames = [];
		possibleFileNames.push(selectedText + extensions);
		return possibleFileNames;
	}

	async getNestedPosition(position: vscode.Position): Promise<[] | [number, number]> {
		const doc = vscode.window.activeTextEditor.document;
		const symbols = await this._symbolProvider.provideDocumentSymbolInformation(doc) as vscode.SymbolInformation[];
		const selection = doc.getWordRangeAtPosition(position);
		const selectedText = doc.getText(selection);

		for (const symbol of symbols) {
			const start = symbol.location.range.start;
			if (
				!doc.lineAt(start.line).isEmptyOrWhitespace
				&& selectedText === symbol.name
			) {
				return [start.line, start.character];
			}
		}
		return [];
	}

	searchFilePath(fileName: String): Thenable<vscode.Uri[]> {
		return vscode.workspace.findFiles(`**/${fileName}`, configurationData.exclude); // Returns promise
	}

	async provideDefinition(document: vscode.TextDocument, position: vscode.Position): Promise<vscode.Location[] | undefined> {
		let filePaths = [];
		const componentNames = this.getComponentName(position);
		const searchPathActions = componentNames.map(this.searchFilePath);
		const searchPromises = Promise.all(searchPathActions); // pass array of promises
		const posInFile = await this.getNestedPosition(position);
		return searchPromises.then(function(paths) {
			filePaths = [].concat.apply([], paths);
			if (filePaths.length) {
				let allPaths = [];
				filePaths.forEach(function(filePath) {
					allPaths.push(new vscode.Location(vscode.Uri.file(`${filePath.path}`), new vscode.Position(0,1)));
				});
				return allPaths;
			} else {
				if (posInFile.length) {
					let allPaths = [];
					allPaths.push(new vscode.Location(document.uri, new vscode.Position(posInFile[0], posInFile[1])));
					return allPaths;
				} else {
					return undefined;
				}
			}
		}, function() {
			return undefined;
		});
	}
}

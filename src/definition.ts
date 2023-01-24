'use strict';

import * as vscode from 'vscode';
import type { ConfigData } from './config/config';
import type { TextmateDocumentSymbolProvider } from './document-symbol';

export class TextmateDefinitionProvider implements vscode.DefinitionProvider {
	constructor(private _config: ConfigData, private _documentSymbolProvider: TextmateDocumentSymbolProvider) {}

	private getComponentGlob(document: vscode.TextDocument, position: vscode.Position): string | undefined {
		const extensions = this._config.extensions;
		if (!extensions) return;

		const selection = document.getWordRangeAtPosition(position);
		const componentName = document.getText(selection);
		const extensionGlob = extensions.substring(1);
		return `${componentName}${extensionGlob}`;
	}

	async getNestedPosition(document: vscode.TextDocument, position: vscode.Position): Promise<vscode.Position | undefined> {
		const symbols = await this._documentSymbolProvider.provideDocumentSymbolInformation(document) as vscode.SymbolInformation[];
		const selection = document.getWordRangeAtPosition(position);
		const selectedText = document.getText(selection);

		for (const symbol of symbols) {
			const start = symbol.location.range.start;
			if (
				!document.lineAt(start.line).isEmptyOrWhitespace
				&& selectedText === symbol.name
			) {
				return new vscode.Position(start.line, start.character);
			}
		}
		return;
	}

	async searchFiles(fileName: string): Promise<vscode.Uri[]> {
		return vscode.workspace.findFiles(fileName, this._config.exclude);
	}

	async provideDefinition(document: vscode.TextDocument, position: vscode.Position): Promise<vscode.Location[] | undefined> {
		const locations: vscode.Location[] = [];
		const filePosition = await this.getNestedPosition(document, position);
		if (filePosition) locations.push(new vscode.Location(document.uri, filePosition));

		const componentGlob = this.getComponentGlob(document, position);
		if (!componentGlob) return locations;

		const workspaceUris = componentGlob ? await this.searchFiles(componentGlob) : [];
		locations.push(...workspaceUris.map(fromUriToLocation));

		return locations;
	}
}


function fromUriToLocation(uri: vscode.Uri): vscode.Location {
	return new vscode.Location(uri, new vscode.Position(0, 1));
}

'use strict';

import * as vscode from 'vscode';
import type { ConfigData } from './config/config';
import type { TextmateDocumentSymbolProvider } from './document-symbol';

export class TextmateDefinitionProvider implements vscode.DefinitionProvider {
	constructor(private _config: ConfigData, private _documentSymbolProvider: TextmateDocumentSymbolProvider) {}

	private getComponentGlob(position: vscode.Position): string | undefined {
		const extensions = this._config.extensions;
		if (!extensions) return;

		const activeTextEditor = vscode.window.activeTextEditor;
		if (!activeTextEditor) return;

		const document = activeTextEditor.document;
		const selection = document.getWordRangeAtPosition(position);
		const componentName = document.getText(selection);
		const extensionGlob = extensions.substring(1);
		return `${componentName}${extensionGlob}`;
	}

	async getNestedPosition(position: vscode.Position): Promise<vscode.Position | undefined> {
		const activeTextEditor = vscode.window.activeTextEditor;
		if (!activeTextEditor) return;

		const document = activeTextEditor.document;
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
		const filePosition = await this.getNestedPosition(position);
		if (filePosition) return [new vscode.Location(document.uri, filePosition)];

		const componentGlob = this.getComponentGlob(position);
		if (!componentGlob) return;

		const workspaceUris = componentGlob ? await this.searchFiles(componentGlob) : [];
		if (workspaceUris.length) return workspaceUris.map(fromUriToLocation);

		return;
	}
}


function fromUriToLocation(uri: vscode.Uri): vscode.Location {
	return new vscode.Location(uri, new vscode.Position(0, 1));
}

'use strict';

import * as vscode from 'vscode';
import type { ConfigData } from './config/config';
import type { OutlineService } from './services/outline';

export class TextmateDefinitionProvider implements vscode.DefinitionProvider {
	constructor(private _config: ConfigData, private _outlineService: OutlineService) {}

	private getComponentGlob(document: vscode.TextDocument, position: vscode.Position): string | void {
		const extensions = this._config.extensions;
		if (!extensions) return void 0;

		const selection = document.getWordRangeAtPosition(position);
		const componentName = document.getText(selection);
		const extensionGlob = extensions.substring(1);
		return `**/${componentName}${extensionGlob}`;
	}

	async getNestedPosition(document: vscode.TextDocument, position: vscode.Position): Promise<vscode.Position | void> {
		const range = document.getWordRangeAtPosition(position);
		const selection = document.getText(range);

		const entry = await this._outlineService.lookup(document, selection);
		return !entry ? void 0 : entry.location.range.start;
	}

	async searchFiles(extensionGlob: string): Promise<vscode.Uri[]> {
		return vscode.workspace.findFiles(extensionGlob, this._config.exclude, 5);
	}

	async provideDefinition(document: vscode.TextDocument, position: vscode.Position): Promise<vscode.Location[]> {
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

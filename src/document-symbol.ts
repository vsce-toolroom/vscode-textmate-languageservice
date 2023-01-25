'use strict';

import * as vscode from 'vscode';
import type { DocumentOutlineService, OutlineEntry } from './services/outline';
import type { SkinnyTextDocument } from './services/document';

interface LanguageSymbol {
	readonly level: number;
	readonly parent: LanguageSymbol | undefined;
	readonly children: vscode.DocumentSymbol[];
}

export class TextmateDocumentSymbolProvider implements vscode.DocumentSymbolProvider {
	constructor(private _outlineService: DocumentOutlineService) { }

	public async provideDocumentSymbolInformation(document: SkinnyTextDocument): Promise<vscode.SymbolInformation[]> {
		const outline = await this._outlineService.fetch(document);
		return outline.map(this.toSymbolInformation.bind(this));
	}

	public async provideDocumentSymbols(document: SkinnyTextDocument): Promise<vscode.DocumentSymbol[]> {
		const outline = await this._outlineService.fetch(document);
		const root: LanguageSymbol = {
			level: -Infinity,
			children: [],
			parent: undefined
		};
		this.buildTree(root, outline);
		return root.children;
	}

	private buildTree(parent: LanguageSymbol, entries: OutlineEntry[]) {
		if (!entries.length) {
			return;
		}

		const entry = entries[0];
		const symbol = this.toDocumentSymbol(entry);
		symbol.children = [];

		while (parent && entry.level <= parent.level) {
			parent = parent.parent!;
		}
		parent.children.push(symbol);
		this.buildTree(
			{
				level: entry.level,
				children: symbol.children,
				parent
			},
			entries.slice(1)
		);
	}


	private toSymbolInformation(entry: OutlineEntry): vscode.SymbolInformation {
		return new vscode.SymbolInformation(
			entry.text,
			entry.type,
			'',
			entry.location
		);
	}

	private toDocumentSymbol(entry: OutlineEntry) {
		return new vscode.DocumentSymbol(
			entry.text,
			entry.token
				.replace(/^meta\./, '')
				.replace(/\.[^.]$/, ''),
			entry.type,
			entry.location.range,
			entry.location.range
		);
	}
}

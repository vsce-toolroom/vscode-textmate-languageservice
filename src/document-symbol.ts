'use strict';

import * as vscode from 'vscode';
import type { OutlineService, OutlineEntry } from './services/outline';
import type { SkinnyTextDocument } from './services/document';

interface LanguageSymbol {
	readonly children: vscode.DocumentSymbol[];
	readonly level: number;
	readonly parent: LanguageSymbol | undefined;
}

export class TextmateDocumentSymbolProvider implements vscode.DocumentSymbolProvider {
	constructor(private _outlineService: OutlineService) {}

	public async provideDocumentSymbolInformation(document: SkinnyTextDocument): Promise<vscode.SymbolInformation[]> {
		const outline = await this._outlineService.fetch(document);
		return outline.map(this.toSymbolInformation.bind(this) as typeof this.toSymbolInformation, outline);
	}

	public async provideDocumentSymbols(document: SkinnyTextDocument): Promise<vscode.DocumentSymbol[]> {
		const outline = await this._outlineService.fetch(document);
		const root: LanguageSymbol = {
			children: [],
			level: -Infinity,
			parent: undefined
		};
		this.traverseAndCopy(root, outline);
		return root.children;
	}

	private traverseAndCopy(parent: LanguageSymbol, entries: OutlineEntry[]) {
		const entry = entries[0];
		const symbol = this.toDocumentSymbol(entry);
		symbol.children = [];

		while (parent && entry.level <= parent.level) {
			parent = parent.parent!;
		}
		parent.children.push(symbol);
		if (entries.length > 1) {
			this.traverseAndCopy(
				{
					children: symbol.children,
					level: entry.level,
					parent
				},
				entries.slice(1)
			);
		}
	}

	private toSymbolInformation(this: OutlineEntry[], entry: OutlineEntry, index: number): vscode.SymbolInformation {
		const previous: OutlineEntry | void = index > 0 ? this[index - 1] : void 0;
		const parent = previous && entry.level > previous.level ? entry.text : '';
		return new vscode.SymbolInformation(
			entry.text,
			entry.type,
			parent,
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

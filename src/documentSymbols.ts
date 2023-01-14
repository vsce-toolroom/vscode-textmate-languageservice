'use strict';

import vscode from 'vscode';
import type { TableOfContentsProvider, TocEntry } from './tableOfContents';
import type { SkinnyTextDocument } from './textmateEngine';

interface LanguageSymbol {
	readonly level: number;
	readonly parent: LanguageSymbol | undefined;
	readonly children: vscode.DocumentSymbol[];
}

export class DocumentSymbolProvider implements vscode.DocumentSymbolProvider {
	constructor(
		private _tocProvider: TableOfContentsProvider
	) { }

	public async provideDocumentSymbolInformation(document: SkinnyTextDocument): Promise<vscode.SymbolInformation[]> {
		const toc = await this._tocProvider.getToc(document);
		return toc.map(this.toSymbolInformation.bind(this));
	}

	public async provideDocumentSymbols(document: SkinnyTextDocument): Promise<vscode.DocumentSymbol[]> {
		const toc = await this._tocProvider.getToc(document);
		const root: LanguageSymbol = {
			level: -Infinity,
			children: [],
			parent: undefined
		};
		this.buildTree(root, toc);
		return root.children;
	}

	private buildTree(parent: LanguageSymbol, entries: TocEntry[]) {
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


	private toSymbolInformation(entry: TocEntry): vscode.SymbolInformation {
		return new vscode.SymbolInformation(
			entry.text,
			entry.type,
			'',
			entry.location
		);
	}

	private toDocumentSymbol(entry: TocEntry) {
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

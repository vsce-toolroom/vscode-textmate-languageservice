'use strict';

import vscode from 'vscode';
import { TableOfContentsProvider, TocEntry } from './tableOfContentsProvider';
import { TextmateEngine, SkinnyTextDocument } from './textmateEngine';

interface LanguageSymbol {
	readonly level: number;
	readonly parent: LanguageSymbol | undefined;
	readonly children: vscode.DocumentSymbol[];
}

export class DocumentSymbolProvider implements vscode.DocumentSymbolProvider {

	constructor(
		public _engine: TextmateEngine
	) { }

	public async provideDocumentSymbolInformation(document: SkinnyTextDocument): Promise<vscode.SymbolInformation[]> {
		const toc = await new TableOfContentsProvider(this._engine).getToc(document);
		return toc.map(entry => this.toSymbolInformation(entry));
	}

	public async provideDocumentSymbols(document: SkinnyTextDocument): Promise<vscode.DocumentSymbol[]> {
		const toc = await new TableOfContentsProvider(this._engine).getToc(document);
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
			entry.token,
			entry.type,
			entry.location.range,
			entry.location.range
		);
	}

	public getEntryText(symbol: vscode.SymbolInformation): string {
		switch (symbol.kind) {
			case vscode.SymbolKind.String:
				return symbol.name.substring(3);
				break;
			default:
				return symbol.name;
				break;
		}
	}
}

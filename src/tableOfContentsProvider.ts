'use strict';

import * as vscode from 'vscode';
import { SkinnyTextDocument, TextmateEngine, configurationData, ITextmateToken } from './textmateEngine';

export interface TocEntry {
	readonly level: number;
	readonly line: number;
	readonly location: vscode.Location;
	readonly text: string;
	readonly token: string;
	readonly type: vscode.SymbolKind;
}

export class TableOfContentsProvider {
	private toc?: TocEntry[];

	public constructor(
		private _document: SkinnyTextDocument,
		private _engine: TextmateEngine
	) { }

	public async getToc(): Promise<TocEntry[]> {
		if (!this.toc) {
			try {
				this.toc = await this.buildToc(this._document);
			} catch (e) {
				this.toc = [];
			}
		}
		return this.toc;
	}

	public async lookup(text: string): Promise<TocEntry | undefined> {
		const toc = await this.getToc();
		return toc.find(entry => entry.text === text);
	}

	private async buildToc(document: SkinnyTextDocument): Promise<TocEntry[]> {
		const toc: TocEntry[] = [];
		const tokens = await this._engine.tokenize(this._engine.scope, document);

		for (const entry of tokens.filter(this.isSymbolToken)) {
			const lineNumber = entry.line;
			const line = document.lineAt(lineNumber);

			toc.push({
				level: entry.level,
				line: lineNumber,
				location: new vscode.Location(
					document.uri,
					new vscode.Range(lineNumber, 0, lineNumber, line.text.length)
				),
				text: this.getText(entry),
				token: entry.type,
				type: configurationData.symbols[entry.type]
			});
		}

		// Get full range of section
		return toc.map((entry, startIndex): TocEntry => {
			let end: number | undefined = undefined;
			for (let i = startIndex + 1; i < toc.length; ++i) {
				if (toc[i].level <= entry.level) {
					end = toc[i].line - 1;
					break;
				}
			}
			const endLine = end ?? document.lineCount - 1;
			return {
				...entry,
				location: new vscode.Location(document.uri,
					new vscode.Range(
						entry.location.range.start,
						new vscode.Position(endLine, document.lineAt(endLine).text.length)
					)
				)
			};
		});
	}

	private isSymbolToken(token: ITextmateToken): boolean {
		return (
			configurationData.symbols[token.type]
			&& (
				!token.type.startsWith('entity')
				|| configurationData.declarations.some((d: string) => new RegExp(d).test(token.scopes.join(' ')))
			)
		);
	}

	private getText(entry: ITextmateToken): string {
		switch (configurationData.symbols[entry.type]) {
			case vscode.SymbolKind.String:
				return `%% ${entry.text}`;
				break;
			default:
				return entry.text;
				break;
		}
	}
}

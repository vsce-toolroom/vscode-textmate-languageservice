'use strict';

import vscode from 'vscode';
import { SkinnyTextDocument, TextmateEngine, configurationData, ITextmateToken, TextmateScopeSelector, TextmateScopeSelectorMap } from './textmateEngine';

const symbolSelectorMap = new TextmateScopeSelectorMap(configurationData.symbols);
const declarationSelector = new TextmateScopeSelector(configurationData.declarations);
const assignmentSeparatorSelector = new TextmateScopeSelector(configurationData.assignment.separator);

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
		private _engine: TextmateEngine
	) { }

	public async getToc(document: SkinnyTextDocument): Promise<TocEntry[]> {
		if (!this.toc) {
			try {
				this.toc = await this.buildToc(document);
			} catch (e) {
				this.toc = [];
			}
		}
		return this.toc;
	}

	public async lookup(document: SkinnyTextDocument, text: string): Promise<TocEntry | undefined> {
		const toc = await this.getToc(document);
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
				text: entry.text,
				token: entry.type,
				type: symbolSelectorMap.value(entry.scopes)
			});
		}

		// Get full range of section
		return toc.map(function(entry: TocEntry, startIndex: number): TocEntry {
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
		const isEntity = new TextmateScopeSelector('entity').match(token.scopes);
		return (
			symbolSelectorMap.has(token.scopes)
			&& (!isEntity || declarationSelector.match(token.scopes))
			&& (!assignmentSeparatorSelector || !assignmentSeparatorSelector.match(token.scopes))
		);
	}
}

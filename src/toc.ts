'use strict';

import vscode from 'vscode';
import sha1 from 'git-sha1';
import delay from 'delay';
import type { SkinnyTextDocument, TextmateEngine, TextmateToken } from './engine';
import { configurationData, TextmateScopeSelector, TextmateScopeSelectorMap } from './engine';

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
	readonly anchor: number;
}

export class TableOfContentsProvider {
	private _queue?: Record<string, boolean> = {};
	private _cache?: Record<string, TocEntry[] | undefined> = {};

	public constructor(
		private _engine: TextmateEngine
	) { }

	public async getToc(document: SkinnyTextDocument): Promise<TocEntry[]> {
		const text = document.getText();
		const hash = sha1(text);
		let toc: TocEntry[];

		if (this._queue[hash]) {
			while (!this._cache[hash]) {
				await delay(100);
			}
			return this._cache[hash];
		}

		if (this._cache[hash]) {
			return this._cache[hash];
		}

		this._queue[hash] = true;
		try {
			toc = await this.buildToc(document);
		} catch (e) {
			toc = [];
		}

		this._cache[hash] = toc;
		return toc;
	}

	public async lookup(document: SkinnyTextDocument, text: string): Promise<TocEntry | undefined> {
		const toc = await this.getToc(document);
		return toc.find(entry => entry.text === text);
	}

	private async buildToc(document: SkinnyTextDocument): Promise<TocEntry[]> {
		const toc: TocEntry[] = [];
		const tokens = await this._engine.tokenize(this._engine.scope, document);

		tokens.forEach(function(this: TableOfContentsProvider, entry: TextmateToken, index: number) {
			if (!isSymbolToken(entry)) {
				return;
			}
			const lineNumber = entry.line;
			toc.push({
				level: entry.level,
				line: lineNumber,
				location: new vscode.Location(
					document.uri,
					new vscode.Range(lineNumber, entry.startIndex, lineNumber, entry.endIndex)
				),
				text: entry.text,
				token: entry.type,
				type: symbolSelectorMap.value(entry.scopes),
				anchor: index
			});
		}, this);

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
}

function isSymbolToken(token: TextmateToken): boolean {
	const isEntity = new TextmateScopeSelector('entity').match(token.scopes);
	return (
		symbolSelectorMap.has(token.scopes)
		&& (!isEntity || declarationSelector.match(token.scopes))
		&& (!assignmentSeparatorSelector || !assignmentSeparatorSelector.match(token.scopes))
	);
}

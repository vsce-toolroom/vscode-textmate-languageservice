'use strict';

import * as vscode from 'vscode';

import { TextmateScopeSelector } from '../util/selectors';
import { ServiceBase } from '../util/service';

import type { ConfigData } from '../config';
import type { LiteTextDocument } from './document';
import type { TokenizerService, TextmateToken } from './tokenizer';

const entitySelector = new TextmateScopeSelector('entity');

export interface OutlineEntry {
	readonly level: number;
	readonly line: number;
	readonly location: vscode.Location;
	readonly text: string;
	readonly token: string;
	readonly type: vscode.SymbolKind;
	readonly anchor: number;
}

export class OutlineService extends ServiceBase<OutlineEntry[]> {
	constructor(private _config: ConfigData, private _tokenService: TokenizerService) {
		super();
	}

	public async lookup(document: LiteTextDocument, text: string): Promise<OutlineEntry | void> {
		const outline = await this.fetch(document);
		return outline.find(entry => entry.text === text);
	}

	public async parse(document: LiteTextDocument): Promise<OutlineEntry[]> {
		const outline: OutlineEntry[] = [];
		const tokens = await this._tokenService.fetch(document);

		for (let index = 0; index < tokens.length; index++) {
			const entry = tokens[index];
			if (!this.isSymbolToken(entry)) {
				continue;
			}

			const lineNumber = entry.line;
			const symbolKind = this._config.selectors.symbols.value(entry.scopes) as number;

			if (outline.length > 0 && lineNumber === outline[outline.length - 1].line) {
				continue;
			}

			outline.push({
				anchor: index,
				level: entry.level,
				line: lineNumber,
				location: new vscode.Location(
					document.uri,
					new vscode.Range(lineNumber, entry.startIndex, lineNumber, entry.endIndex)
				),
				text: entry.text,
				token: entry.type,
				type: symbolKind
			});
		}

		// Get full range of section
		return outline.map(function(entry: OutlineEntry, startIndex: number): OutlineEntry {
			let end: number;
			for (let i = startIndex + 1; i < outline.length; ++i) {
				if (outline[i].level <= entry.level) {
					end = outline[i].line - 1;
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

	private isSymbolToken(token: TextmateToken): boolean {
		const isEntity = entitySelector.match(token.scopes);
		return (
			this._config.selectors.symbols.has(token.scopes)
			&& (!isEntity || this._config.selectors.declarations.match(token.scopes))
			&& (!this._config.selectors.assignment.separator.match(token.scopes))
		);
	}
}

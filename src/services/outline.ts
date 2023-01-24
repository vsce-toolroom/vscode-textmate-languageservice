'use strict';

import * as vscode from 'vscode';
import sha1 = require('git-sha1');
import delay = require('delay');
import { TextmateScopeSelector } from '../parser/selectors';
import type { ConfigData } from '../config/config';
import type { SkinnyTextDocument } from './document';
import type { TextmateTokenizerService, TextmateToken } from './tokenizer';

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

export class DocumentOutlineService {
	constructor(private _tokenizer: TextmateTokenizerService, private _config: ConfigData) {}

	private _queue?: Record<string, boolean> = {};
	private _cache?: Record<string, OutlineEntry[] | undefined> = {};

	public async getOutline(document: SkinnyTextDocument): Promise<OutlineEntry[]> {
		const text = document.getText();
		const hash = sha1(text);
		let outline: OutlineEntry[];

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
			outline = await this.buildOutline(document);
		} catch (e) {
			outline = [];
		}

		this._cache[hash] = outline;
		return outline;
	}

	public async lookup(document: SkinnyTextDocument, text: string): Promise<OutlineEntry | undefined> {
		const outline = await this.getOutline(document);
		return outline.find(entry => entry.text === text);
	}

	private async buildOutline(document: SkinnyTextDocument): Promise<OutlineEntry[]> {
		const outline: OutlineEntry[] = [];
		const tokens = await this._tokenizer.tokenize(document);

		tokens.forEach(function(this: DocumentOutlineService, entry: TextmateToken, index: number) {
			if (!this.isSymbolToken(entry)) {
				return;
			}
			const lineNumber = entry.line;
			outline.push({
				level: entry.level,
				line: lineNumber,
				location: new vscode.Location(
					document.uri,
					new vscode.Range(lineNumber, entry.startIndex, lineNumber, entry.endIndex)
				),
				text: entry.text,
				token: entry.type,
				type: this._config.selectors.symbols.value(entry.scopes),
				anchor: index
			});
		}, this);

		// Get full range of section
		return outline.map(function(entry: OutlineEntry, startIndex: number): OutlineEntry {
			let end: number | undefined = undefined;
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

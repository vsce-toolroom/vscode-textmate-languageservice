'use strict';

import * as vscode from 'vscode';
import sha1 = require('git-sha1');
import delay = require('delay');
import { TextmateScopeSelector } from './parser/selectors';
import type { ConfigData } from './config/config';
import type { TextmateToken, TextmateTokenizerService } from './services/tokenizer';
import type { OutlineEntry, DocumentOutlineService } from './services/outline';

const rangeLimit = 5000;
const commentScopeSelector = new TextmateScopeSelector('comment');

export interface FoldingToken {
	isStart: boolean,
	line: number
};

export class TextmateFoldingProvider implements vscode.FoldingRangeProvider {
	constructor(private _config: ConfigData, private _tokenizer: TextmateTokenizerService, private _outliner: DocumentOutlineService) {}

	private _queue?: Record<string, boolean> = {};
	private _cache?: Record<string, vscode.FoldingRange[] | undefined> = {};

	public async provideFoldingRanges(
		document: vscode.TextDocument,
		_: vscode.FoldingContext,
		_token: vscode.CancellationToken
	): Promise<vscode.FoldingRange[]> {
		const text = document.getText();
		const hash = sha1(text);
		let folds: vscode.FoldingRange[];

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

		const foldables = await Promise.all([
			this.getRegions(document),
			this.getHeaderFoldingRanges(document),
			this.getBlockFoldingRanges(document)
		]);
		folds = [].concat(...foldables).slice(0, rangeLimit);

		this._cache[hash] = folds;
		delete this._queue[hash];

		return folds;
	}

	private async getRegions(document: vscode.TextDocument): Promise<vscode.FoldingRange[]> {
		const tokens = await this._tokenizer.tokenize(document);
		const regions = tokens.filter(this.isRegion.bind(this));
		const markers = regions.map(function(token) {
			return {
				line: token.line,
				isStart: this.isStartRegion(token.text)
			};
		});

		const nestingStack: FoldingToken[] = [];
		const ranges: vscode.FoldingRange[] = [];

		for (let index = 0; index < markers.length; index++) {
			const marker = markers[index];
			if (marker.isStart) {
				nestingStack.push(marker);
			} else if (nestingStack.length && nestingStack[nestingStack.length - 1].isStart) {
				ranges.push(new vscode.FoldingRange(nestingStack.pop()!.line, marker.line, vscode.FoldingRangeKind.Region));
			} else {
				// noop: invalid nesting (i.e. [end, start] or [start, end, end])
			}
		}

		return ranges;
	}

	private async getHeaderFoldingRanges(document: vscode.TextDocument) {
		const tokens = await this._tokenizer.tokenize(document)
		const outline = await this._outliner.getOutline(document);

		const sections = outline.filter(this.isSectionEntry.bind(this));
		const ranges: vscode.FoldingRange[] = [];

		for (let index = 1; index < sections.length; index++) {
			let section = sections[index];
			let startLine = section.line;
			let endLine = sections.hasOwnProperty(index + 1)
				? sections[index + 1].line - 1
				: document.lineCount - 1;

			const dedentRange = tokens.slice(section.anchor + 1, sections[index + 1]?.anchor);
			const dedentToken = dedentRange.find(function(token: TextmateToken) {
				return token.line > startLine && token.line < endLine && token.level < section.level;
			});
			if (dedentToken) {
				endLine = dedentToken.line - 1;
			}
			while (document.lineAt(endLine).isEmptyOrWhitespace && endLine >= startLine + 1) {
				endLine--;
			}

			ranges.push(new vscode.FoldingRange(startLine, endLine));
		}

		return ranges;
	}

	private async getBlockFoldingRanges(document: vscode.TextDocument): Promise<vscode.FoldingRange[]> {
		const tokens = await this._tokenizer.tokenize(document);
		const ranges: vscode.FoldingRange[] = [];

		for (let index = 1; index < tokens.length; index++) {
			const token = tokens[index];
			if (token.level <= tokens[index - 1].level) {
				continue;
			}
			// token.level > tokens[index - 1].level
			for (let subindex = index; subindex < tokens.length; subindex++) {
				const subtoken = tokens[subindex];
				if (subtoken.level >= token.level) {
					continue;
				}
				// subtoken.level < token.level
				const range = new vscode.FoldingRange(
					token.line,
					tokens[subindex].line,
					this.getFoldingRangeKind(token)
				);
				ranges.push(range);
				break;
			}
		}

		return ranges;
	}

	private getFoldingRangeKind(listItem: TextmateToken): vscode.FoldingRangeKind | undefined {
		return this._config.selectors.comments.blockComment.match(listItem.type)
			? vscode.FoldingRangeKind.Comment
			: undefined;
	}

	private isComment(token: TextmateToken): boolean {
		return commentScopeSelector.match(token.scopes);
	}

	private isRegion(token: TextmateToken): boolean {
		return this.isComment(token) && (this.isStartRegion(token) || this.isEndRegion(token));
	}

	private isStartRegion(token: TextmateToken): boolean {
		return this._config.selectors.markers.start.test(token.text);
	}

	private isEndRegion(token: TextmateToken): boolean {
		return this._config.selectors.markers.end.test(token.text);
	}

	private isSectionEntry(entry: OutlineEntry): boolean {
		return entry.type === vscode.SymbolKind.String;
	}
}

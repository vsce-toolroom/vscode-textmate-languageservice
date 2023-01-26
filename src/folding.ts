'use strict';

import * as vscode from 'vscode';
import type { ConfigData } from './config/config';
import type { TextmateToken, TextmateTokenizerService } from './services/tokenizer';
import type { OutlineEntry, DocumentOutlineService } from './services/outline';
import { TextmateScopeSelector } from './util/selectors';

const rangeLimit = 5000;
const commentScopeSelector = new TextmateScopeSelector('comment');

export interface FoldingToken {
	isStart: boolean;
	line: number;
}

export class TextmateFoldingRangeProvider implements vscode.FoldingRangeProvider {
	constructor(private _config: ConfigData, private _tokenizer: TextmateTokenizerService, private _outlineService: DocumentOutlineService) {}

	public async provideFoldingRanges(
		document: vscode.TextDocument,
		_: vscode.FoldingContext,
		_token: vscode.CancellationToken
	): Promise<vscode.FoldingRange[]> {
		const tokens = await this._tokenizer.fetch(document);
		const outline = await this._outlineService.fetch(document);

		const foldables = await Promise.all([
			this.getRegions(document, tokens, outline),
			this.getHeaderFoldingRanges(document, tokens, outline),
			this.getBlockFoldingRanges(tokens)
		]);

		return [].concat(...foldables).slice(0, rangeLimit);
	}

	private async getRegions(document: vscode.TextDocument, tokens: TextmateToken[], outline: OutlineEntry[]): Promise<vscode.FoldingRange[]> {
		const regions = tokens.filter(this.isRegion.bind(this));
		const markers = regions.map(function(token) {
			return {
				line: token.line,
				isStart: this.isStartRegion(token.text)
			};
		});

		const stack: FoldingToken[] = [];
		const ranges: vscode.FoldingRange[] = [];

		for (let index = 0; index < markers.length; index++) {
			const marker = markers[index];
			if (marker.isStart) {
				stack.push(marker);
			} else if (stack.length && stack[stack.length - 1].isStart) {
				const start = stack.pop()!.line;
				const end = marker.line;
				const kind = vscode.FoldingRangeKind.Region;
				ranges.push(new vscode.FoldingRange(start, end, kind));
			} else {
				// noop: invalid nesting (i.e. [end, start] or [start, end, end])
			}
		}

		return ranges;
	}

	private async getHeaderFoldingRanges(document: vscode.TextDocument, tokens: TextmateToken[], outline: OutlineEntry[]) {
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

	private async getBlockFoldingRanges(tokens: TextmateToken[]): Promise<vscode.FoldingRange[]> {
		const bounds: TextmateToken[] = tokens.filter(this.isBlockBoundary, tokens);
		const markers = bounds.map(function(token, index) {
			return { ...token, isStart: tokens[index + 1].level > token.level };
		});
		
		const stack: FoldingToken[] = [];
		const ranges: vscode.FoldingRange[] = [];
		
		for (let index = 0; index < markers.length; index++) {
			const marker = markers[index];
			if (marker.isStart) {
				stack.push(marker);
			} else if (stack.length && stack[stack.length - 1].isStart) {
				const start = stack.pop()!.line + 1;
				const end = marker.line + 1;
				const kind = this.getBlockFoldingRangeKind(marker);
				ranges.push(new vscode.FoldingRange(start, end, kind));
			} else {
				// noop: invalid nesting (i.e. [end, start] or [start, end, end])
			}
		}

		return ranges;
	}

	private getBlockFoldingRangeKind(token: TextmateToken): vscode.FoldingRangeKind | undefined {
		return commentScopeSelector.match(token.type) ? vscode.FoldingRangeKind.Comment : undefined;
	}

	private isBlockBoundary(this: TextmateToken[], token: TextmateToken, index: number) {
		return index !== this.length - 1 && this[index + 1].level !== token.level;
	}

	private isComment(token: TextmateToken): boolean {
		return /(?:^| )comment(?: |$)/.test(token.scopes.join(' '));
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

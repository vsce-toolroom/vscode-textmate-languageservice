'use strict';

import vscode from 'vscode';
import { TextmateToken, TextmateEngine, configurationData, TextmateScopeSelector } from './textmateEngine';
import type { TableOfContentsProvider, TocEntry } from './tableOfContents';

const rangeLimit = 5000;

export interface FoldingToken {
	isStart: boolean,
	line: number
};

export class FoldingProvider implements vscode.FoldingRangeProvider {
	constructor(
		private _engine: TextmateEngine,
		private _tocProvider: TableOfContentsProvider
	) { }

	public async provideFoldingRanges(
		document: vscode.TextDocument,
		_: vscode.FoldingContext,
		_token: vscode.CancellationToken
	): Promise<vscode.FoldingRange[]> {
		const foldables = await Promise.all([
			this.getRegions(document),
			this.getHeaderFoldingRanges(document),
			this.getBlockFoldingRanges(document)
		]);
		return [].concat(...foldables).slice(0, rangeLimit);
	}

	private async getRegions(document: vscode.TextDocument): Promise<vscode.FoldingRange[]> {
		const tokens = await this._engine.tokenize(this._engine.scope, document);
		const regions = tokens.filter(isRegion);
		const markers = regions.map(function(token) {
			return {
				line: token.line,
				isStart: isStartRegion(token.text)
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

	private async getHeaderFoldingRanges(document: vscode.TextDocument) {		const tokens = await this._engine.tokenize(this._engine.scope, document)
		const toc = await this._tocProvider.getToc(document);

		const sections = toc.filter(isSectionEntry);
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
		const tokens = await this._engine.tokenize(this._engine.scope, document);
		const ranges: vscode.FoldingRange[] = [];

		for (let index = 1; index < tokens.length; index++) {
			const token = tokens[index];
			if (token.level <= tokens[index - 1].level) {
				continue;
			}

			for (let subindex = index; subindex < tokens.length; subindex++) {
				const subtoken = tokens[subindex];
				if (subtoken.level >= token.level) {
					continue;
				}
				const range = new vscode.FoldingRange(
					token.line - 1,
					token.level === 1
						? tokens[subindex - 1].line
						: tokens[subindex - 1].line - 1,
					this.getFoldingRangeKind(token)
				);
				ranges.push(range);
				break;
			}
		}

		return ranges;
	}

	private getFoldingRangeKind(listItem: TextmateToken): vscode.FoldingRangeKind | undefined {
		return listItem.type === configurationData.comments.blockComment
			? vscode.FoldingRangeKind.Comment
			: undefined;
	}
}

const startRegionPattern = new RegExp(configurationData.markers.start);
const isStartRegion = (text: string): boolean => startRegionPattern.test(text);
const endRegionPattern = new RegExp(configurationData.markers.end);
const isEndRegion = (text: string): boolean => endRegionPattern.test(text);
const commentScopeSelector = new TextmateScopeSelector(configurationData.comments.lineComment);
const isComment = (token: TextmateToken): boolean => commentScopeSelector.match(token.scopes);
function isRegion(token: TextmateToken): boolean {
	return isComment(token) && (isStartRegion(token.text) || isEndRegion(token.text));
};
const isSectionEntry = (entry: TocEntry) => entry.type === vscode.SymbolKind.String;

'use strict';

import vscode from 'vscode';
import { TextmateToken, TextmateEngine, configurationData } from './textmateEngine';
import { TableOfContentsProvider, TocEntry } from './tableOfContentsProvider';

const rangeLimit = 5000;

export interface FoldingToken {
	isStart: boolean,
	line: number
};

export class FoldingProvider implements vscode.FoldingRangeProvider {

	constructor(
		private _engine: TextmateEngine
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
		const regionMarkers = tokens.filter(function(token: TextmateToken): boolean {
			return (
				token.type === configurationData.comments.lineComment
				&& (isStartRegion(token.text) || isEndRegion(token.text))
			);
		}).map(function(token) {
			return {
				line: token.line,
				isStart: isStartRegion(token.text)
			};
		});

		const nestingStack: FoldingToken[] = [];
		return regionMarkers
			.map(function(marker) {
				marker.line = marker.line;
				if (marker.isStart) {
					nestingStack.push(marker);
				} else if (nestingStack.length && nestingStack[nestingStack.length - 1].isStart) {
					return new vscode.FoldingRange(nestingStack.pop()!.line, marker.line, vscode.FoldingRangeKind.Region);
				} else {
					// noop: invalid nesting (i.e. [end, start] or [start, end, end])
				}
				return null;
			})
			.filter((region: vscode.FoldingRange | null): region is vscode.FoldingRange => !!region);
	}

	private async getHeaderFoldingRanges(document: vscode.TextDocument) {
		const tokens = await this._engine.tokenize(this._engine.scope, document)
		const tocProvider = new TableOfContentsProvider(this._engine);
		const toc = await tocProvider.getToc(document);
		const sections = toc.filter(function(this: TocEntry[], entry: TocEntry, _: number) {
			return entry.type === vscode.SymbolKind.String;
		});
		return sections.map(function(section: TocEntry, index: number) {
			let startLine = section.line;
			let endLine = sections.hasOwnProperty(index + 1)
				? sections[index + 1].line - 1
				: document.lineCount - 1;
			const dedentToken = tokens.find(function(this: TextmateToken[], token: TextmateToken, index: number) {
				return (
					(!tokens[index - 1] || token.level !== tokens[index - 1].level)
					&& (token.line > startLine && token.line < endLine)
					&& token.level < section.level
				);
			});
			if (dedentToken) {
				endLine = dedentToken.line - 1;
			}
			while (document.lineAt(endLine).isEmptyOrWhitespace && endLine >= startLine + 1) {
				endLine--;
			}
			return new vscode.FoldingRange(startLine, endLine);
		});
	}

	private async getBlockFoldingRanges(document: vscode.TextDocument): Promise<vscode.FoldingRange[]> {
		const tokens = await this._engine.tokenize(this._engine.scope, document);
		const ranges: vscode.FoldingRange[] = [];
		for (let index = 1; index < tokens.length; index++) {
			const token = tokens[index];
			if (token.level > tokens[index - 1].level) {
				for (let subindex = index; subindex < tokens.length; subindex++) {
					const subtoken = tokens[subindex];
					if (subtoken.level < token.level) {
						const range = new vscode.FoldingRange(
							token.line - 1,
							tokens[subindex - 1].line - 1,
							this.getFoldingRangeKind(token)
						);
						ranges.push(range);
					}
				}
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

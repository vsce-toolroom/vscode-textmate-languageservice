/* --------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 * -------------------------------------------------------------------------------------------*/
'use strict';

import * as vscode from 'vscode';
import { readFileText } from '../util/loader';
import { Disposable } from '../util/dispose';

import type { ConfigData } from '../config';
import { ContributorData } from '../util/contributes';

const contributorData = new ContributorData();

const _languageId2WordDefinition = new Map<string, RegExp>();
export function setWordDefinitionFor(languageId: string, wordDefinition: RegExp): void {
	if (!wordDefinition) {
		_languageId2WordDefinition.delete(languageId);
	} else {
		_languageId2WordDefinition.set(languageId, wordDefinition);
	}
}

function getWordDefinitionFor(languageId: string): RegExp | undefined {
	return _languageId2WordDefinition.get(languageId);
}

const defaultWordPattern = /-?\d*\.\d\w*|[^\`\~\!\@\#\$\%\^\&\*\(\)\-\=\+\[\{\]\}\\\|\;\:\'\"\,\.\<\>\/\?\s]+/;

const EolMap = {
	'\n': vscode.EndOfLine.LF,
	'\r\n': vscode.EndOfLine.CRLF
};

export class FullTextDocument implements vscode.TextDocument {
	private _eol: vscode.EndOfLine;
	private _fileName: string;
	private _isClosed: boolean;
	private _isDirty: boolean;
	private _isUntitled: boolean;
	private _languageId: string;
	private _lineCount: number;
	private _uri: vscode.Uri;
	private _version: number;
	private _lines: vscode.TextLine[];
	private _content: string;
	private _lineOffsets: any;

	constructor(uri: vscode.Uri, languageId: string, content: string) {
		this._lines = [];

		const parts = content.split(/(\r?\n)/);

		const endOfLine = EolMap[parts[1]] || vscode.EndOfLine.LF;
		const lineCount = Math.floor(parts.length / 2) + 1;

		for (let lineNumber = 0; lineNumber < lineCount; lineNumber++) {
			const text = parts[lineNumber * 2];
			const ws = parts[lineNumber * 2 + 1];

			const start = new vscode.Position(lineNumber, 0);
			const end = new vscode.Position(lineNumber, text.length);
			const range = new vscode.Range(start, end);

			this._lines.push({
				firstNonWhitespaceCharacterIndex: text.match(/^\s*/)[0].length,
				isEmptyOrWhitespace: !/\S/.test(text),
				lineNumber,
				range,
				rangeIncludingLineBreak: ws.endsWith('\r')
					? range.with(start, end.translate(-1))
					: range,
				text
			});
		}

		this._content = content;
		this._eol = endOfLine;
		this._fileName = uri.path.split('/').pop();
		this._isClosed = false;
		this._isDirty = false;
		this._isUntitled = false;
		this._languageId = languageId;
		this._lineCount = lineCount;
		this._uri = uri;
		this._version = 0;
	}

	public get fileName(): string {
		return this._fileName;
	}

	public get isUntitled(): boolean {
		return this._isUntitled;
	}

	public get isDirty(): boolean {
		return this._isDirty;
	}

	public get isClosed(): boolean {
		return this._isClosed;
	}

	public get eol(): vscode.EndOfLine {
		return this._eol;
	}

	public get uri(): vscode.Uri {
		return this._uri;
	}

	public get languageId(): string {
		return this._languageId;
	}

	public get version(): number {
		return this._version;
	}

	public get lineCount() {
		return this._lineCount;
	}

	public save(): Thenable<boolean> {
		return Promise.resolve(false);
	}

	public lineAt(offset: number | vscode.Position): vscode.TextLine {
		const lineNumber = typeof offset === 'object' ? offset.line : offset;
		return this._lines[lineNumber];
	}

	public offsetAt(position: vscode.Position): number {
		const lineOffsets = this._getLineOffsets();

		if (position.line >= lineOffsets.length) {
			return this._content.length;
		} else if (position.line < 0) {
			return 0;
		}

		const lineOffset = lineOffsets[position.line];
		const nextLineOffset = position.line + 1 < lineOffsets.length
			? lineOffsets[position.line + 1]
			: this._content.length;

		return Math.max(Math.min(lineOffset + position.character, nextLineOffset), lineOffset);
	}

	public positionAt(offset: number): vscode.Position {
		offset = Math.max(Math.min(offset, this._content.length), 0);

		const lineOffsets = this._getLineOffsets();
		let low = 0;
		let high = lineOffsets.length;
		if (high === 0) {
			return new vscode.Position(0, offset);
		}
		while (low < high) {
			const mid = Math.floor((low + high) / 2);
			if (lineOffsets[mid] > offset) {
				high = mid;
			} else {
				low = mid + 1;
			}
		}
		// low is the least x for which the line offset is larger than the current offset
		// or array.length if no line offset is larger than the current offset
		const line = low - 1;
		return new vscode.Position(line, offset - lineOffsets[line]);
	}

	public getText(range?: vscode.Range): string {
		if (range) {
			const start = this.offsetAt(range.start);
			const end = this.offsetAt(range.end);
			return this._content.substring(start, end);
		}
		return this._content;
	}

	public getWordRangeAtPosition(position: vscode.Position, regex?: RegExp): vscode.Range {
		const validPosition = this.validatePosition(position);
		const line = this.lineAt(validPosition.line);

		if (!regex) {
			// use default when custom-regexp isn't provided
			regex = getWordDefinitionFor(this._languageId);

		} else if (regExpLeadsToEndlessLoop(regex)) {
			// use default when custom-regexp is bad
			throw new Error(`[getWordRangeAtPosition]: ignoring custom regexp '${regex.source}' because it matches the empty string.`);
		}

		const wordAtText = getWordAtText(
			validPosition.character + 1,
			ensureValidWordDefinition(regex),
			line.text,
			0
		);

		if (wordAtText) {
			return new vscode.Range(
				validPosition.line,
				wordAtText.startColumn - 1,
				validPosition.line,
				wordAtText.endColumn - 1
			);
		}
		return void 0;
	}

	public validateRange(range: vscode.Range): vscode.Range {
		const validStart = this.validatePosition(range.start);
		const validEnd = this.validatePosition(range.end);

		if (validStart.isEqual(range.start) && validEnd.isEqual(range.end)) {
			return range;
		}

		if (
			range.start.line > range.end.line ||
			(range.start.line === range.end.line && range.start.character > range.end.character)
		) {
			return new vscode.Range(range.end, range.start);
		}

		return new vscode.Range(validStart, validEnd);
	}

	public validatePosition(position: vscode.Position): vscode.Position {
		if (this._lines.length === 0) {
			return position.with(0, 0);
		}

		let { line, character } = position;
		let hasChanged = false;

		if (line < 0) {
			line = 0;
			character = 0;
			hasChanged = true;
		} else if (line >= this._lines.length) {
			line = this._lines.length - 1;
			character = this._lines[line].text.length;
			hasChanged = true;
		} else {
			const maxCharacter = this._lines[line].text.length;
			if (character < 0) {
				character = 0;
				hasChanged = true;
			} else if (character > maxCharacter) {
				character = maxCharacter;
				hasChanged = true;
			}
		}

		if (!hasChanged) {
			return position;
		}
		return new vscode.Position(line, character);
	}

	private _getLineOffsets() {
		if (this._lineOffsets === undefined) {
			this._lineOffsets = computeLineOffsets(this._content, true);
		}
		return this._lineOffsets;
	}

}

export interface DocumentServiceInterface {
	readonly onDidChangeDocument: vscode.Event<vscode.TextDocument>;
	readonly onDidCreateDocument: vscode.Event<vscode.TextDocument>;
	readonly onDidDeleteDocument: vscode.Event<vscode.Uri>;

	getAllDocuments(): Thenable<Iterable<vscode.TextDocument>>;
	getDocument(resource: vscode.Uri): Thenable<vscode.TextDocument | undefined>;
}

export class DocumentService extends Disposable implements DocumentServiceInterface {
	private readonly _onDidChangeDocumentEmitter = this._register(new vscode.EventEmitter<vscode.TextDocument>());
	private readonly _onDidCreateDocumentEmitter = this._register(new vscode.EventEmitter<vscode.TextDocument>());
	private readonly _onDidDeleteDocumentEmitter = this._register(new vscode.EventEmitter<vscode.Uri>());

	private _watcher: vscode.FileSystemWatcher | undefined;

	constructor(private _languageId: string, private _config: ConfigData) {
		super();
	}

	public get onDidChangeDocument() {
		this.ensureWatcher();
		return this._onDidChangeDocumentEmitter.event;
	}

	public get onDidCreateDocument() {
		this.ensureWatcher();
		return this._onDidCreateDocumentEmitter.event;
	}

	public get onDidDeleteDocument() {
		this.ensureWatcher();
		return this._onDidDeleteDocumentEmitter.event;
	}

	public async getAllDocuments() {
		const resources = await vscode.workspace.findFiles(this._config.include, this._config.exclude);
		const docs = await Promise.all(resources.map(doc => this.getDocument(doc)));
		return docs.filter((doc): doc is vscode.TextDocument => !!doc);
	}

	public async getDocument(resource: vscode.Uri): Promise<vscode.TextDocument> {
		const matchingDocuments = vscode.workspace.textDocuments.filter(function(document) {
			return document.uri.toString(true) === resource.toString(true);
		});
		if (matchingDocuments.length !== 0) {
			return matchingDocuments[0];
		}

		const text = await readFileText(resource);
		const filename = resource.path.split('/').pop();
		const point = contributorData.getLanguageDefinitionFromFilename(filename);
		const languageId = point.id;

		if (!getWordDefinitionFor(languageId)) {
			const configuration = await contributorData.getLanguageConfigurationFromLanguageId(languageId);
			setWordDefinitionFor(languageId, configuration.wordPattern || defaultWordPattern);
		}

		return new FullTextDocument(resource, languageId, text);
	}

	private ensureWatcher(): void {
		if (this._watcher) {
			return void 0;
		}

		this._watcher = this._register(vscode.workspace.createFileSystemWatcher(this._config.include));

		this._watcher.onDidChange(async function(this: DocumentService, resource: vscode.Uri) {
			const document = await this.getDocument(resource);
			if (document) {
				this._onDidChangeDocumentEmitter.fire(document);
			}
		}, this, this._disposables);

		this._watcher.onDidCreate(async function(this: DocumentService, resource: vscode.Uri) {
			const document = await this.getDocument(resource);
			if (document) {
				this._onDidCreateDocumentEmitter.fire(document);
			}
		}, this, this._disposables);

		this._watcher.onDidDelete(function(this: DocumentService, resource: vscode.Uri) {
			this._onDidDeleteDocumentEmitter.fire(resource);
		}, this, this._disposables);

		vscode.workspace.onDidChangeTextDocument(function(this: DocumentService, e: vscode.TextDocumentChangeEvent) {
			if (e.document.languageId === this._languageId) {
				this._onDidChangeDocumentEmitter.fire(e.document);
			}
		}, this, this._disposables);
	}
}

const CharCode = {
	/**
	 * The `\r` character.
	 */
	CarriageReturn: 13,
	/**
	 * The `\n` character.
	 */
	LineFeed: 10
};

function computeLineOffsets(text: string, isAtLineStart: boolean, textOffset = 0): number[] {
	const result: number[] = isAtLineStart ? [textOffset] : [];

	for (let i = 0; i < text.length; i++) {
		const ch = text.charCodeAt(i);
		if (ch === CharCode.CarriageReturn || ch === CharCode.LineFeed) {
			if (ch === CharCode.CarriageReturn && i + 1 < text.length && text.charCodeAt(i + 1) === CharCode.LineFeed) {
				i++;
			}
			result.push(textOffset + i + 1);
		}
	}

	return result;
}

function ensureValidWordDefinition(wordDefinition?: RegExp | null): RegExp {
	let result: RegExp = defaultWordPattern;

	if (wordDefinition && (wordDefinition instanceof RegExp)) {
		if (!wordDefinition.global) {
			let flags = 'g';
			if (wordDefinition.ignoreCase) {
				flags += 'i';
			}
			if (wordDefinition.multiline) {
				flags += 'm';
			}
			if (wordDefinition.unicode) {
				flags += 'u';
			}
			result = new RegExp(wordDefinition.source, flags);
		} else {
			result = wordDefinition;
		}
	}

	result.lastIndex = 0;

	return result;
}

interface IWordAtPosition {
	readonly word: string;
	readonly startColumn: number;
	readonly endColumn: number;
}

const getWordAtTextConfig = {
	maxLen: 1000,
	timeBudget: 150,
	windowSize: 15
};

function getWordAtText(column: number, wordDefinition: RegExp, text: string, textOffset: number): IWordAtPosition | null {
	if (text.length > getWordAtTextConfig.maxLen) {
		// don't throw strings that long at the regexp
		// but use a sub-string in which a word must occur
		let start = column - getWordAtTextConfig.maxLen / 2;
		if (start < 0) {
			start = 0;
		} else {
			textOffset += start;
		}
		text = text.substring(start, column + getWordAtTextConfig.maxLen / 2);
		return getWordAtText(column, wordDefinition, text, textOffset);
	}

	const t1 = Date.now();
	const pos = column - 1 - textOffset;

	let prevRegexIndex = -1;
	let match: RegExpExecArray | null = null;

	for (let i = 1; ; i++) {
		// check time budget
		if (Date.now() - t1 >= getWordAtTextConfig.timeBudget) {
			break;
		}

		// reset the index at which the regexp should start matching, also know where it
		// should stop so that subsequent search don't repeat previous searches
		const regexIndex = pos - getWordAtTextConfig.windowSize * i;
		wordDefinition.lastIndex = Math.max(0, regexIndex);
		const thisMatch = _findRegexMatchEnclosingPosition(wordDefinition, text, pos, prevRegexIndex);

		if (!thisMatch && match) {
			// stop: we have something
			break;
		}

		match = thisMatch;

		// stop: searched at start
		if (regexIndex <= 0) {
			break;
		}
		prevRegexIndex = regexIndex;
	}

	if (match) {
		const result = {
			endColumn: textOffset + 1 + match.index + match[0].length,
			startColumn: textOffset + 1 + match.index,
			word: match[0],
		};
		wordDefinition.lastIndex = 0;
		return result;
	}

	return null;
}

function _findRegexMatchEnclosingPosition(wordDefinition: RegExp, text: string, pos: number, stopPos: number): RegExpExecArray | null {
	let match: RegExpExecArray | null;
	while (match = wordDefinition.exec(text)) {
		const matchIndex = match.index || 0;
		if (matchIndex <= pos && wordDefinition.lastIndex >= pos) {
			return match;
		} else if (stopPos > 0 && matchIndex > stopPos) {
			return null;
		}
	}
	return null;
}


function regExpLeadsToEndlessLoop(regexp: RegExp): boolean {
	// Exit early if it's one of these special cases which are meant to match
	// against an empty string
	if (regexp.source === '^' || regexp.source === '^$' || regexp.source === '$' || regexp.source === '^\\s*$') {
		return false;
	}

	// We check against an empty string. If the regular expression doesn't advance
	// (e.g. ends in an endless loop) it will match an empty string.
	const match = regexp.exec('');
	return !!(match && regexp.lastIndex === 0);
}

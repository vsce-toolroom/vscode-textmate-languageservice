'use strict';

import * as vscode from 'vscode';
import { GeneratorService } from './services/generators';
import { TextmateScopeSelector } from './util/selectors';
import type { LiteTextDocument } from './services/document';
import type { TextmateToken } from './services/tokenizer';

const generators = new GeneratorService();

const commentScopeSelector = new TextmateScopeSelector('comment');
const stringScopeSelector = new TextmateScopeSelector('string');
const regexScopeSelector = new TextmateScopeSelector('regex');

/**
 * Get token scope information at a specific position (caret line and character number).
 * @param {LiteTextDocument} document Document to be tokenized.
 * @param {vscode.Position} position Zero-indexed caret position of token in document.
 * @returns {Promise<TextmateToken>} Promise resolving to token data for scope selected by caret position.
 */
export async function getScopeInformationAtPosition(document: LiteTextDocument, position: vscode.Position): Promise<TextmateToken> {
	const generator = await generators.fetch(document.languageId);
	const tokenService = await generator.initTokenService();
	const tokens = await tokenService.fetch(document);
	const caret = tokens.find(findTokenByPosition(position));
	return caret;
};

/**
 * VS Code compatible performant API for token information at a caret position.
 * @param {LiteTextDocument} document Document to be tokenized.
 * @param {vscode.Position} position Zero-indexed caret position of token in document.
 * @returns {Promise<vscode.TokenInformation>} Promise resolving to token data compatible with VS Code.
 */
export async function getTokenInformationAtPosition(document: LiteTextDocument, position: vscode.Position): Promise<vscode.TokenInformation> {
	const caret = await getScopeInformationAtPosition(document, position);
	const range = new vscode.Range(caret.line, caret.startIndex, caret.line, caret.endIndex);
	const type = getTokenTypeFromScope(caret.scopes);
	return { range, type };
};

/**
 * Get matching scope range of the Textmate token intersecting a caret position.
 * @param {LiteTextDocument} document Document to be tokenized.
 * @param {vscode.Position} position Zero-indexed caret position to intersect with.
 * @returns {Promise<vscode.Range>} Promise resolving to character and line number of the range.
 */
export async function getScopeRangeAtPosition(document: LiteTextDocument, position: vscode.Position): Promise<vscode.Range> {
	const caret = await getScopeInformationAtPosition(document, position);
	const range = new vscode.Range(caret.line, caret.startIndex, caret.line, caret.endIndex);
	return range;
};

function findTokenByPosition(position: vscode.Position) {
	return function(t: TextmateToken) {
		return position.line === t.line && position.character >= t.startIndex && position.character <= t.endIndex;
	}
}

function getTokenTypeFromScope(scopes: string[]): vscode.StandardTokenType {
	switch (true) {
		case commentScopeSelector.match(scopes):
			return vscode.StandardTokenType.Comment;
		case regexScopeSelector.match(scopes):
			return vscode.StandardTokenType.RegEx;
		case stringScopeSelector.match(scopes):
			return vscode.StandardTokenType.String;
		default:
			return vscode.StandardTokenType.Other;
	}
}

import * as vscode from 'vscode';
import TextmateLanguageService from '../..';

const TextmateScopeSelector = TextmateLanguageService.utils.TextmateScopeSelector;

// $ExpectType TextmateScopeSelector
const commentScopeSelector = new TextmateScopeSelector('comment');

// $ExpectType boolean
const result = commentScopeSelector.match(['source.ts', 'comment.line.double-slash.ts']);
if (result === true) {
	void vscode.window.showInformationMessage('TS comment matching OK');
}

// $ExpectType TextmateLanguageService
const typescriptService = new TextmateLanguageService('typescript');

// $ExpectType TokenizerService
const textmateTokenService = await typescriptService.initTokenService();

const textDocument = vscode.window.activeTextEditor.document;

// $ExpectType TextmateToken[]
const tokens = await textmateTokenService.fetch(textDocument);

if (tokens[tokens.length - 1].line === (textDocument.lineCount - 1)) {
	void vscode.window.showInformationMessage('Tokenization OK');
}

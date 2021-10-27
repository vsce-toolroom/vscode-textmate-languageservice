'use strict';

import * as path from 'path';
import * as vscode from 'vscode';
import * as fs from 'fs';
import * as pkgDir from 'pkg-dir';
import * as delay from 'delay';
import { IGrammar, INITIAL, IToken, ITokenizeLineResult, Registry, StackElement } from 'vscode-textmate';
import { IGrammarRegistration, ILanguageRegistration, Resolver } from './util/registryResolver';
import { getOniguruma } from './util/onigLibs';

export const extensionPath = pkgDir.sync(path.dirname(pkgDir.sync(__dirname)));

export const configurationData = require(path.resolve(extensionPath, './textmate-configuration.json'));

export interface SkinnyTextLine {
	text: string;
}

export interface SkinnyTextDocument {
	readonly uri: vscode.Uri;
	readonly version: number;
	readonly lineCount: number;

	lineAt(line: number): SkinnyTextLine;
	getText(): string;
}

type Mutable<T> = {
	-readonly[P in keyof T]: T[P]
};

export interface ITextmateToken extends Mutable<IToken> {
	level: number;
	line: number;
	text: string;
	type: string;
}

export interface ITextmateTokenizeLineResult extends ITokenizeLineResult {
	readonly tokens: ITextmateToken[],
	readonly stack: StackElement
}

interface ITextmateTokenizerState {
	context: boolean;
	continuation:	boolean;
	declaration: boolean;
	line: number;
	rule: StackElement;
	stack: number;
}

export const packageJSON = JSON.parse(fs.readFileSync(
	path.resolve(extensionPath, './package.json'),
	{ encoding: 'utf8' }
));

export class TextmateEngine {
	constructor(
		public language: string,
		public scope: string
	) {}

	public scopes?: string[] = [];

	private _state?: ITextmateTokenizerState = {
		context: false,
		continuation: false,
		declaration: false,
		line: 0,
		rule: INITIAL,
		stack: 0
	};

	private _queue: Record<string, boolean> = {};

	private _cache: Record<string, ITextmateToken[] | undefined> = {};

	private _grammars?: IGrammar[] = [];

	public async tokenize(scope: string, document: SkinnyTextDocument): Promise<ITextmateToken[]> {
		if (!this.scopes.includes(scope)) {
			await this.load(scope);
		}

		const grammar = this._grammars[this.scopes.indexOf(scope)];

		const text = document.getText();
		const tokens: ITextmateToken[] = [];

		if (this._queue[text]) {
			while (!this._cache[text]) {
				await delay(100);
			}
			return this._cache[text];
		} else {
			this._queue[text] = true;
		}

		for (let lineNumber = 0; lineNumber < document.lineCount; lineNumber++) {
			let line: SkinnyTextLine = document.lineAt(lineNumber);
			const lineTokens = grammar.tokenizeLine(line.text, this._state.rule) as ITextmateTokenizeLineResult;

			for (const token of lineTokens.tokens) {
				token.type = token.scopes[token.scopes.length - 1];
				token.text = line.text.substring(token.startIndex, token.endIndex);
				token.line = lineNumber;
			}

			for (let i = 0; i < (lineTokens.tokens.length - 1); i++) {
				const token = lineTokens.tokens[i];
				const nextToken = lineTokens.tokens[i + 1];

				if (
					configurationData.assignment
					&& (
						(
							token.scopes.includes(configurationData.assignment.single)
							&& nextToken.scopes.includes(configurationData.assignment.single)
						)
						|| (
							token.scopes.includes(configurationData.assignment.multiple)
							&& nextToken.scopes.includes(configurationData.assignment.multiple)
							&& nextToken.type !== configurationData.assignment.separator
						)
					)
				) {
						token.endIndex = nextToken.endIndex;
						token.text += nextToken.text;
						lineTokens.tokens.splice(i + 1, 1);
						i--;
				}
			}

			for (const token of lineTokens.tokens) {
				this._state.declaration =
					configurationData.indentation[token.type] === 1
					|| configurationData.dedentation.includes(token.type)
					|| this._state.declaration;

				if (this._state.declaration) {
					if (token.type === configurationData.punctuation.continuaton) {
						this._state.continuation = true;
					}

					if (
						!configurationData.indentation.hasOwnProperty(token.type)
						&& !this._state.continuation
						&& lineNumber > this._state.line
					) {
						this._state.declaration = false;
						this._state.stack++;
					}
				}

				if (
					configurationData.indentation.hasOwnProperty(token.type)
					&& (!this._state.declaration || configurationData.dedentation.includes(token.type))
				) {
					this._state.stack += configurationData.indentation[token.type];
				}

				token.level = this._state.stack;
				tokens.push(token);

				this._state.line = lineNumber;
				this._state.rule = lineTokens.ruleStack;
			}
		}

		this._cache[text] = tokens;
		return tokens;
	}

	async load(scope: string): Promise<void> {
		const grammar = configurationData.grammar as IGrammarRegistration;
		grammar.path = path.resolve(extensionPath, grammar.path);
		const language = configurationData.language as ILanguageRegistration;
		const onigLibPromise = getOniguruma();
		const resolver = new Resolver([grammar], [language], onigLibPromise);
		const registry = new Registry(resolver);
		this._grammars.push(await registry.loadGrammar(grammar.scopeName));
		this.scopes.push(scope);
	}
}

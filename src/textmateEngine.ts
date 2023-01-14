'use strict';

import pkgUp from 'pkg-up';
import path from 'path';
import vscode from 'vscode';
import loadJsonFile from 'load-json-file';
import sha1 from 'git-sha1';
import delay from 'delay';
import { GrammarRegistration, LanguageRegistration, Resolver } from './util/registry';
import { getOniguruma } from './util/oniguruma';
import ScopeSelector from './util/scopes';

import getCoreNodeModule from './util/getCoreNodeModule';
import vscodeTextmate from 'vscode-textmate';
const vscodeTextmateModule = getCoreNodeModule<typeof vscodeTextmate>('vscode-textmate');

const extensionPath = path.resolve(pkgUp.sync({ cwd: __dirname }), '../../..');
export const configurationData = loadJsonFile.sync(path.resolve(extensionPath, './textmate-configuration.json')) as any;

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

export interface TextmateToken extends Mutable<vscodeTextmate.IToken> {
	level: number;
	line: number;
	text: string;
	type: string;
}

export interface TextmateTokenizeLineResult extends Omit<vscodeTextmate.ITokenizeLineResult, 'tokens'> {
	readonly tokens: TextmateToken[]
}

interface TextmateTokenizerState {
	delta: number;
	continuation: boolean;
	declaration: boolean;
	line: number;
	rule: vscodeTextmate.StackElement;
	stack: number;
}

export class TextmateScopeSelector {
	selectors?: ScopeSelector[];
	selector?: ScopeSelector;

	constructor(s: string[] | string) {
		if (Array.isArray(s)) {
			this.selectors = s.filter(function(selector) {
				return typeof selector === 'string';
			}).map(function(selector) {
				try {
					if (selector !== undefined && selector !== null) {
						return new ScopeSelector(selector);
					}
				} catch (error) {
					throw new Error(
						`"${selector}" is an invalid Textmate scope selector.` +
						(error?.message ? `\n\n${error.message}` : '')
					);
				}
			});
		} else {
			try {
				if (typeof s === 'string') {
					this.selector = new ScopeSelector(s);
				}
			} catch (error) {
				throw new Error(
					`"${s}" is an invalid Textmate scope selector.` +
					(error?.message ? `\n\n${error.message}` : '')
				);
			}
		}
	}

	match(scopes: string[]): boolean {
		if (!this.selectors && !this.selector) {
			return false;
		}
		if (this.selectors) {
			return this.selectors.some(function(selector) {
				return selector.matches(scopes);
			});
		}
		if (this.selector) {
			return this.selector.matches(scopes);
		}
	}

	include(scopes: string[][]): boolean {
		if (!this.selectors && !this.selector) {
			return false;
		}
		return scopes.some(this.match.bind(this));
	}
}

export class TextmateScopeSelectorMap {
	selectors: object;

	constructor(selectors: Record<string, number> | null | undefined) {
		if (typeof selectors === 'object' && selectors instanceof Object) {
			this.selectors = selectors;
		}
	}

	key(scopes: string[]): string | undefined {
		if (!this.selectors) {
			return;
		}
		return Object.keys(this.selectors).filter(function(selector) {
			try {
				return (new ScopeSelector(selector)).matches(scopes);
			} catch (error) {
				throw new Error(
					`"${selector}" is an invalid Textmate scope selector.` +
					(error?.message ? `\n\n${error.message}` : '')
				);
			}
		})[0];
	}

	has(scopes: string[]): boolean {
		return typeof this.key(scopes) === 'string';
	}

	value(scopes: string[]): number | undefined {
		if (!this.selectors) {
			return;
		}
		return this.selectors[this.key(scopes)];
	}
}

const singleAssignmentSelector = new TextmateScopeSelector(configurationData.assignment.single);
const multipleAssignmentSelector = new TextmateScopeSelector(configurationData.assignment.multiple);
const assignmentSeparatorSelector = new TextmateScopeSelector(configurationData.assignment.separator);

const continuationSelector = new TextmateScopeSelector(configurationData.punctuation.continuaton);
const indentationSelectorMap = new TextmateScopeSelectorMap(configurationData.indentation);
const dedentationSelector = new TextmateScopeSelector(configurationData.dedentation);

export const packageJSON = loadJsonFile.sync(path.resolve(extensionPath, './package.json')) as any;

export class TextmateEngine {
	constructor(
		public language: string,
		public scope: string
	) {}

	public scopes?: string[] = [];

	private _state?: TextmateTokenizerState = {
		delta: 0,
		continuation: false,
		declaration: false,
		line: 0,
		rule: vscodeTextmateModule.INITIAL,
		stack: 0
	};

	private _queue: Record<string, boolean> = {};

	private _cache: Record<string, TextmateToken[] | undefined> = {};

	private _grammars?: vscodeTextmate.IGrammar[] = [];

	public async tokenize(scope: string, document: SkinnyTextDocument): Promise<TextmateToken[]> {
		if (!this.scopes.includes(scope)) {
			await this.load(scope);
		}

		const grammar = this._grammars[this.scopes.indexOf(scope)];

		const text = document.getText();
		const hash = sha1(text);
		const tokens: TextmateToken[] = [];

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
		this._state.continuation = false;
		this._state.declaration = false;
		this._state.line = 0;
		this._state.rule = vscodeTextmateModule.INITIAL;
		this._state.stack = 0;

		for (let lineNumber = 0; lineNumber < document.lineCount; lineNumber++) {
			let line: SkinnyTextLine = document.lineAt(lineNumber);
			const lineTokens = grammar.tokenizeLine(line.text, this._state.rule) as TextmateTokenizeLineResult;

			for (const token of lineTokens.tokens) {
				token.type = token.scopes[token.scopes.length - 1];
				token.text = line.text.substring(token.startIndex, token.endIndex);
				token.line = lineNumber;
			}

			for (let index = 0; index < (lineTokens.tokens.length - 1); index++) {
				const token = lineTokens.tokens[index];
				const nextToken = lineTokens.tokens[index + 1];

				if (typeof configurationData.assignment === 'object') {
					if (
						(
							singleAssignmentSelector.match(token.scopes)
							&& singleAssignmentSelector.match(nextToken.scopes)
						)
						|| (
							multipleAssignmentSelector.match(token.scopes)
							&& multipleAssignmentSelector.match(nextToken.scopes)
							&& !assignmentSeparatorSelector.match(nextToken.scopes)
						)
					) {
						token.endIndex = nextToken.endIndex;
						token.text += nextToken.text;
						lineTokens.tokens.splice(index + 1, 1);
						index--;
					}
				}
			}

			for (const token of lineTokens.tokens) {
				this._state.declaration = (
					indentationSelectorMap.value(token.scopes) > 0
					|| dedentationSelector.match(token.scopes)
					|| this._state.declaration
				);

				if (indentationSelectorMap.value(token.scopes) > 0) {
					this._state.delta = indentationSelectorMap.value(token.scopes);
				}

				if (this._state.declaration) {
					if (continuationSelector.match(token.scopes)) {
						this._state.continuation = true;
					}

					if (
						!indentationSelectorMap.has(token.scopes)
						&& !this._state.continuation
						&& lineNumber > this._state.line
					) {
						this._state.declaration = false;
						this._state.stack += this._state.delta;
					}
				}

				if (indentationSelectorMap.value(token.scopes) < 0) {
					this._state.stack += indentationSelectorMap.value(token.scopes);
				}

				token.level = this._state.stack;
				tokens.push(token);

				this._state.line = lineNumber;
				this._state.rule = lineTokens.ruleStack;
			}
		}

		this._cache[hash] = tokens;
		delete this._queue[hash];
		return tokens;
	}

	async load(scope: string): Promise<void> {
		const grammar = configurationData.grammar as GrammarRegistration;
		grammar.path = path.resolve(extensionPath, grammar.path);
		const language = configurationData.language as LanguageRegistration;
		const onigLibPromise = getOniguruma();
		const resolver = new Resolver([grammar], [language], onigLibPromise);
		const registry = new vscodeTextmateModule.Registry(resolver);
		this._grammars.push(await registry.loadGrammar(grammar.scopeName));
		this.scopes.push(scope);
	}
}

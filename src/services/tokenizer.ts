'use strict';

import * as textmate from 'vscode-textmate';

import type { SkinnyTextDocument, SkinnyTextLine } from './document';
import type { Mutable } from 'type-fest';
import type { ConfigData } from '../config/config';
import { ServiceBase } from '../util/service';

export interface TextmateToken extends Mutable<textmate.IToken> {
	level: number;
	line: number;
	text: string;
	type: string;
}

export interface TextmateTokenizeLineResult extends Omit<textmate.ITokenizeLineResult, 'tokens'> {
	readonly tokens: TextmateToken[]
}

interface TextmateTokenizerState {
	delta: number;
	continuation: boolean;
	declaration: boolean;
	line: number;
	rule: textmate.StackElement;
	stack: number;
}

export class TextmateTokenizerService extends ServiceBase<TextmateToken[]> {
	constructor(
		private _config: ConfigData,
		private _grammar: textmate.IGrammar
	) {
		super();
	}

	private _states: Record<string, TextmateTokenizerState> = {};

	public async parse(document: SkinnyTextDocument): Promise<TextmateToken[]> {
		const tokens: TextmateToken[] = [];

		const state = this._states[document.uri.path] = {} as TextmateTokenizerState;
		state.delta = 0;
		state.continuation = false;
		state.declaration = false;
		state.line = 0;
		state.rule = textmate.INITIAL;
		state.stack = 0;

		for (let lineNumber = 0; lineNumber < document.lineCount; lineNumber++) {
			const line: SkinnyTextLine = document.lineAt(lineNumber);
			const lineResult = this._grammar.tokenizeLine(line.text, state.rule) as TextmateTokenizeLineResult;

			for (const token of lineResult.tokens) {
				token.type = token.scopes[token.scopes.length - 1];
				token.text = line.text.substring(token.startIndex, token.endIndex);
				token.line = lineNumber;
			}

			for (let index = 0; index < (lineResult.tokens.length - 1); index++) {
				const token = lineResult.tokens[index];
				const nextToken = lineResult.tokens[index + 1];

				if (
					(
						this._config.selectors.assignment.single.match(token.scopes)
						&& this._config.selectors.assignment.single.match(nextToken.scopes)
					)
					|| (
						this._config.selectors.assignment.multiple.match(token.scopes)
						&& this._config.selectors.assignment.multiple.match(nextToken.scopes)
						&& !this._config.selectors.assignment.separator.match(nextToken.scopes)
					)
				) {
					token.endIndex = nextToken.endIndex;
					token.text += nextToken.text;
					lineResult.tokens.splice(index + 1, 1);
					index--;
				}
			}

			for (let index = 0; index < lineResult.tokens.length; index++) {
				const token = lineResult.tokens[index];
				const delta = this._config.selectors.indentation.value(token.scopes) || 0;
				const isIndentToken = delta > 0;
				const isDedentToken = delta < 0;
				const isRedentToken = this._config.selectors.dedentation.match(token.scopes);
				const isDeclarationToken = isIndentToken || isRedentToken;
				const isContinuationToken = this._config.selectors.punctuation.continuation.match(token.scopes);

				if (state.declaration === false) {
					if (isDedentToken) {
						state.stack += delta;
						let subindex =  index - 1;
						while (subindex >= 0) {
							lineResult.tokens[subindex].level += delta;
							subindex -= 1;
						}
					}
					if (isDeclarationToken) {
						state.delta += Math.abs(delta);
					}
				}

				if (state.declaration && !isRedentToken) { // handle redent e.g. ELSE-IF clause
					state.delta += delta;
				}

				state.declaration = state.declaration || isDeclarationToken;
				state.continuation = state.continuation || isContinuationToken;

				if (state.declaration && lineNumber > state.line) {
					if (state.continuation === false) {
						state.stack += state.delta;
						state.delta = 0;
						state.declaration = false;
					} else {
						state.continuation = false;
					}
				}

				token.level = state.stack;
				state.line = lineNumber;
			}

			state.rule = lineResult.ruleStack;
			tokens.push(...lineResult.tokens);
		}

		delete this._states[document.uri.path];
		return tokens;
	}
}

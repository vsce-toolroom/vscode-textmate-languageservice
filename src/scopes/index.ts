/*---------------------------------------------------------------------------------------------
 *  Copyright (c) GitHub Inc. All rights reserved.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
'use strict';

import type { ParsedMatcher, GroupPrefix } from './matchers';
import * as parser from './parser';

const matcherCache: Record<string, ParsedMatcher> = {};

/**
 * @author Github Inc.
 * @see https://github.com/atom/first-mate/blob/v7.4.2/src/scope-selector.coffee
 */
class ScopeSelector {
	private _matchCache: Record<string, boolean | undefined> = {};
	private _prefixCache: Record<string, GroupPrefix | null | undefined> = {};
	private matcher: ParsedMatcher;

	/**
	 *  Create a new scope selector.
	 *  @param {string} source The string to parse as a scope selector.
	 *  @return A newly constructed ScopeSelector.
	 */
	constructor(source: string) {
		if (matcherCache[source]) {
			this.matcher = matcherCache[source];
		} else {
			this.matcher = parser.parse(source) as ParsedMatcher;
			matcherCache[source] = this.matcher;
		}
	}

	/**
	 *  Check if this scope selector matches the scopes.
	 *  @param {string|string[]} scopes A single scope or an array of them to be compared against.
	 *  @return {boolean} Whether or not this ScopeSelector matched.
	 */
	matches(scopes: string | string[]): boolean {
		if (typeof scopes === 'string') {
			scopes = [scopes];
		}
		const target = scopes.join(' ');
		const entry = this._matchCache[target];

		if (typeof entry !== 'undefined') {
			return entry;
		} else {
			const result = this.matcher.matches(scopes);
			this._matchCache[target] = result;
			return result;
		}
	}

	/**
	 *  Gets the prefix of this scope selector.
	 *  @param {string|string[]} scopes The scopes to match a prefix against.
	 *  @return {string|undefined} The matching prefix, if there is one.
	 */
	getPrefix(scopes: string | string[]): GroupPrefix | void {
		if (typeof scopes === 'string') {
			scopes = [scopes];
		}
		const target = scopes.join(' ');
		const entry = this._prefixCache[target];

		if (typeof entry !== 'undefined') {
			return entry === null ? undefined : entry;
		} else {
			const result = this.matcher.getPrefix(scopes) || null;
			this._prefixCache[target] = result;
			return result === null ? undefined : result;
		}
	}

	/**
	 *  Gets the priority of this scope selector.
	 *  @param {string|string[]} scopes The scopes to match a priority against.
	 *  @return {string|undefined} The matching priority, if there is one.
	 */
	getPriority(scopes: string | string[]): number {
		switch (this.getPrefix(scopes)) {
			case 'L': // left - before non-prefixed rules
				return -1;
			case 'R': // right - after non-prefixed rules
				return 1;
			default:
				return 0;
		}
	}
}

export class TextmateScopeSelector {
	public readonly source: string[] | string;
	public readonly isArray: boolean;
	private selector: ScopeSelector[] | ScopeSelector;

	constructor(s: string[] | string) {
		this.source = s;
		if (Array.isArray(s)) {
			this.selector = s.map(scopeSelectorFactory);
		}
		if (typeof s === 'string') {
			this.selector = scopeSelectorFactory(s);
		}
	}

	match(scopes: string[] | string): boolean {
		if (!this.selector) {
			return false;
		}
		if (Array.isArray(this.selector)) {
			return this.selector.some(s => s.matches(scopes));
		}
		if (this.selector) {
			return this.selector.matches(scopes);
		}
	}

	include(scopes: string[][]): boolean {
		if (!this.selector) {
			return false;
		}
		return scopes.some(this.match.bind(this));
	}

}

function scopeSelectorFactory(selector: string): ScopeSelector {
	try {
		return new ScopeSelector(selector);
	} catch (error) {
		throw new Error(`"${selector}" is an invalid Textmate scope selector. ${error?.message || ''}`);
	}
}

export class TextmateScopeSelectorMap {
	private selectors: Map<TextmateScopeSelector, number | undefined>;

	constructor(selectors: Record<string, number> | null | undefined) {
		this.selectors = new Map();
		if (typeof selectors === 'object' && !Array.isArray(selectors)) {
			for (const key in selectors) {
				this.selectors.set(new TextmateScopeSelector(key), selectors[key])
			}
		}
	}

	key(scopes: string[]): string | undefined {
		if (!this.selectors) {
			return;
		}
		for (const entry of this.selectors) {
			if (entry[0].match(scopes)) return entry[0].source as string;
		}
		return;
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

/*---------------------------------------------------------------------------------------------
 *  Copyright (c) GitHub Inc. All rights reserved.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
'use strict';

import * as parser from './parser';
import type { ParsedMatcher, GroupPrefix } from './matchers';

const matcherCache: Record<string, ParsedMatcher> = {};

/**
 * @author Github Inc.
 * @see https://github.com/atom/first-mate/blob/v7.4.2/src/scope-selector.coffee
 */
export class ScopeSelector {
	private _matchCache: Record<string, boolean | undefined> = {};
	private _prefixCache: Record<string, GroupPrefix | null | undefined> = {};
	private matcher: ParsedMatcher;

	/**
	 *  Create a new scope selector.
	 *  @param {string} source The string to parse as a scope selector.
	 *  @return A newly constructed ScopeSelector.
	 */
	constructor(public readonly source: string) {
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

	toString(): string {
		return this.source;
	}
}

export class TextmateScopeSelector {
	public readonly isArray: boolean;
	private selector: ScopeSelector[] | ScopeSelector;

	constructor(public readonly source?: string[] | string) {
		if (Array.isArray(source)) {
			this.selector = source.map(ScopeSelectorFactory);
		}
		if (typeof source === 'string') {
			this.selector = ScopeSelectorFactory(source);
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

	toString(): string {
		return Array.isArray(this.source) ? this.source.join(', ') : String(this.source);
	}
}

function ScopeSelectorFactory(selector: string): ScopeSelector {
	try {
		return new ScopeSelector(selector);
	} catch (error) {
		throw new Error(`"${selector}" is an invalid Textmate scope selector. ${error?.message || ''}`);
	}
}

export class TextmateScopeSelectorMap {
	private matchers: Record<string, TextmateScopeSelector | undefined>;

	constructor(public readonly sourcemap: Record<string, number> | undefined) {
		this.matchers = {};
		if (typeof sourcemap === 'object' && sourcemap?.constructor === Object) {
			for (const key in sourcemap) this.matchers[key] = new TextmateScopeSelector(key);
		}
	}

	key(scopes: string[]): string | undefined {
		if (!this.sourcemap) {
			return;
		}
		for (const key in this.sourcemap) {
			if (this.matchers[key].match(scopes)) return key;
		}
		return;
	}

	has(scopes: string[]): boolean {
		return typeof this.key(scopes) === 'string';
	}

	value(scopes: string[]): number | undefined {
		if (!this.sourcemap) {
			return;
		}
		return this.sourcemap[this.key(scopes)];
	}

	toString(): string {
		return String(this.sourcemap);
	}
}

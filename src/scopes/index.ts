/* --------------------------------------------------------------------------------------------
 *  Copyright (c) GitHub Inc. All rights reserved.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 * -------------------------------------------------------------------------------------------*/
'use strict';

import * as parser from './parser';

import type { ParsedMatcher, GroupPrefix } from './matchers';

export class FirstMateSelector {
	private _cache: Record<string, boolean | undefined> = {};
	private _prefixes: Record<string, GroupPrefix | null | undefined> = {};
	private matcher: ParsedMatcher;

	/**
	 * Create a new scope selector.
	 *
	 * @param {string} source The string to parse as a scope selector.
	 * @return A newly constructed ParsedSelector.
	 */
	constructor(public readonly source: string) {
		this.matcher = parser.parse(source) as ParsedMatcher;
	}

	/**
	 * Check if this scope selector matches the scopes.
	 *
	 * @param {string|string[]} scopes A single scope or an array of them to be compared against.
	 * @return {boolean} Whether or not this ParsedSelector matched.
	 */
	public matches(scopes: string | string[]): boolean {
		if (typeof scopes === 'string') {
			scopes = [scopes];
		}
		const target = scopes.join(' ');
		const entry = this._cache[target];

		if (typeof entry !== 'undefined') {
			return entry;
		} else {
			const result = this.matcher.matches(scopes);
			return (this._cache[target] = result);
		}
	}

	/**
	 * Gets the prefix of this scope selector.
	 *
	 * @param {string|string[]} scopes The scopes to match a prefix against.
	 * @return {string|undefined} The matching prefix, if there is one.
	 */
	public getPrefix(scopes: string | string[]): GroupPrefix | undefined {
		if (typeof scopes === 'string') {
			scopes = [scopes];
		}
		const target = typeof scopes === 'string' ? scopes : scopes.join(' ');
		const entry = this._prefixes[target];

		if (typeof entry !== 'undefined') {
			return entry === null ? undefined : entry;
		} else {
			const result = this.matcher.getPrefix(scopes) || null;
			this._prefixes[target] = result;
			return result;
		}
	}

	/**
	 * Gets the priority of this scope selector.
	 *
	 * @param {string|string[]} scopes The scopes to match a priority against.
	 * @return {string|undefined} The matching priority, if there is one.
	 */
	public getPriority(scopes: string | string[]): number {
		switch (this.getPrefix(scopes)) {
			case 'L': // left - before non-prefixed rules
				return -1;
			case 'R': // right - after non-prefixed rules
				return 1;
			default:
				return 0;
		}
	}

	public toString(): string {
		return this.source;
	}
}

export namespace rules {
	export type Start = parser.Start;
	export type Atom = parser.Atom;
	export type Scope = parser.Scope;
	export type Path = parser.Path;
	export type Group = parser.Group;
	export type Expression = parser.Expression;
	export type Composite = parser.Composite;
	export type Selector = parser.Selector;
}

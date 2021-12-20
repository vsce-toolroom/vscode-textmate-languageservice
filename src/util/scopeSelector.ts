/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import ScopeSelectorParser from './scopeSelectorParser';

const selectorCache: Map<string, any> = new Map();

export default class ScopeSelector {
	cache: Map<string, boolean>;
	matcher: any;

	/**
	 *  Create a new scope selector.
	 *  @param {string} source The string to parse as a scope selector.
	 *  @return A newly constructed ScopeSelector.
	 */
	constructor(source) {
		this.cache = new Map();
		if (selectorCache.get(source)) {
			this.matcher = selectorCache.get(source);
		} else {
			this.matcher = ScopeSelectorParser.parse(source);
			selectorCache.set(source, this.matcher)
		}
	}

	/**
	 *  Check if this scope selector matches the scopes.
	 *  @param {string|string[]} scopes A single scope or an array of them to be compared against.
	 *  @return {boolean} Whether or not this ScopeSelector matched.
	 */
	matches(scopes): boolean {
		if (typeof scopes === 'string') {
			scopes = [scopes];
		}
		const target = scopes.join(' ');

		if (this.cache.get(target)) {
			return this.cache.get(target);
		} else {
			const result = this.matcher.matches(scopes);
			this.cache.set(target, result);
			return result;
		}
	}

	/**
	 *  Gets the prefix of this scope selector.
	 *  @param {string|string[]} scopes The scopes to match a prefix against.
	 *  @return {?string} The matching prefix, if there is one.
	 */
	getPrefix(scopes): string | undefined {
		if (typeof scopes === 'string') {
			scopes = [scopes];
		}
		return this.matcher.getPrefix(scopes);
	}

	/**
	 * Convert this TextMate scope selector to a CSS selector.
	 *  @return {string} CSSSelector representation of this ScopeSelector.
	 */
	toCssSelector(): string {
		return this.matcher.toCssSelector();
	}

	/**
	 *  Convert this TextMate scope selector to a CSS selector, prefixing scopes
	 *  with `syntax--`.
	 *  @return {string} Syntax-specific CSSSelector representation of this
	 *  ScopeSelector.
	 */
	toCssSyntaxSelector(): string {
		return this.matcher.toCssSyntaxSelector();
	}
};
diff --git a/src/util/scopeSelectorMatchers.js b/src/util/scopeSelectorMatchers.js

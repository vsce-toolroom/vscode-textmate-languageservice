'use strict';

import { FirstMateSelector } from './base';

export class TextmateScopeSelector {
	public readonly isArray: boolean;
	private selector: FirstMateSelector[] | FirstMateSelector;

	constructor(public readonly source?: string[] | string) {
		if (Array.isArray(source)) {
			this.selector = source.map(firstMateSelectorFactory);
		}
		if (typeof source === 'string') {
			this.selector = firstMateSelectorFactory(source);
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

function firstMateSelectorFactory(selector: string): FirstMateSelector {
	try {
		return new FirstMateSelector(selector);
	} catch (error) {
		throw new Error(`'${selector}' is an invalid Textmate scope selector. ${error?.message || ''}`);
	}
}

export class TextmateScopeSelectorMap {
	private matchers: Record<string, FirstMateSelector | undefined>;

	constructor(public readonly sourcemap: Record<string, number> | undefined) {
		this.matchers = {};
		if (typeof sourcemap === 'object' && sourcemap?.constructor === Object) {
			for (const key in sourcemap) this.matchers[key] = firstMateSelectorFactory(key);
		}
	}

	key(scopes: string[]): string | undefined {
		if (!this.sourcemap) {
			return;
		}
		for (const key in this.sourcemap) {
			if (this.matchers[key].matches(scopes)) return key;
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

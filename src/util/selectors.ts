'use strict';

import { FirstMateSelector } from '../parser/scopes';

function isTextmateScopeBoundary(char) {
	return ['', '.', ' '].includes(char);
}

class FastScopeSelector {
	private _cache: Record<string, boolean | undefined> = {};

	constructor(public readonly source: string) {}

	matches(scopes: string | string[]) {
		if (typeof scopes === 'string') scopes = [scopes];
		const target = scopes.join(' ');
		const entry = this._cache[target];

		if (typeof entry !== 'undefined') {
			return entry;
		} else {
			const position = target.indexOf(this.source);
			if (position === -1) {
				return (this._cache[target] = false);
			}
			const left = target.charAt(position - 1)
			const right = target.charAt(position + this.source.length)

			return (this._cache[target] = [left, right].every(isTextmateScopeBoundary));
		}
	}

	getPrefix(_: string | string[]): undefined {
		return;
	}

	getPriority(_: string | string[]): undefined {
		return;
	}

	toString(): string {
		return this.source;
	}
}

type ScopeSelector = FastScopeSelector | FirstMateSelector;

export class TextmateScopeSelector {
	public readonly isArray: boolean;
	private selector: ScopeSelector[] | ScopeSelector;

	constructor(public readonly source?: string[] | string) {
		if (Array.isArray(source)) {
			this.selector = source.map(optimizedSelectorFactory);
		}
		if (typeof source === 'string') {
			this.selector = optimizedSelectorFactory(source);
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

function optimizedSelectorFactory(selector: string): FastScopeSelector | FirstMateSelector {
	try {
		return /[ *:()|&-,]/.test(selector) ? new FirstMateSelector(selector) : new FastScopeSelector(selector);
	} catch (error) {
		throw new Error(`'${selector}' is an invalid Textmate scope selector. ${error?.message || ''}`.trim());
	}
}

export class TextmateScopeSelectorMap {
	private matchers: Record<string, ScopeSelector | undefined>;

	constructor(public readonly sourcemap: Record<string, number> | undefined) {
		this.matchers = {};
		if (typeof sourcemap === 'object' && sourcemap?.constructor === Object) {
			for (const key in sourcemap) this.matchers[key] = optimizedSelectorFactory(key);
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

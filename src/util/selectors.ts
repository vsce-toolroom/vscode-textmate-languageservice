'use strict';

import { FirstMateSelector } from '../parser/scopes';

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

			const isScopeBoundary = (c: string) => ['', '.', ' '].includes(c);
			return (this._cache[target] = [left, right].every(isScopeBoundary));
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

function isSelectorAtScopeLevel(selector: string) {
	return (
		/[a-zA-Z0-9+_]$/.test(selector) &&
		/^[a-zA-Z0-9+_]/.test(selector) &&
		!/[^a-zA-Z0-9+_\-.]/.test(selector)
	);
}

function optimizedSelectorFactory(selector: string): ScopeSelector {
	try {
		return isSelectorAtScopeLevel(selector)
			? new FastScopeSelector(selector)
			: new FirstMateSelector(selector);
	} catch (error) {
		throw new Error(`'${selector}' is an invalid Textmate scope selector. ${error?.message || ''}`.trim());
	}
}

export class TextmateScopeSelectorMap {
	private matchers: Record<string, ScopeSelector>;

	constructor(public readonly sourcemap: Record<string, number> | undefined) {
		this.matchers = {};
		if (typeof sourcemap === 'object' && sourcemap?.constructor === Object) {
			for (const key in sourcemap) this.matchers[key] = optimizedSelectorFactory(key);
		}
	}

	key(scopes: string | string[]): string | void {
		if (!this.sourcemap) {
			return void 0;
		}
		for (const key in this.sourcemap) {
			if (this.matchers[key].matches(scopes)) return key;
		}
		return void 0;
	}

	has(scopes: string | string[]): boolean {
		return typeof this.key(scopes) === 'string';
	}

	value(scopes: string | string[]): number | void {
		const key = this.key(scopes);
		if (!this.sourcemap || !key) {
			return void 0;
		}
		return this.sourcemap[key];
	}

	toString(): string {
		return JSON.stringify(this.sourcemap);
	}
}

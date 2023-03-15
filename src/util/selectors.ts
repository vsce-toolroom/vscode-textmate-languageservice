'use strict';

import { FirstMateSelector } from '../scopes';
import { FastScopeSelector } from './fast-selector';

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

	public match(scopes: string[] | string): boolean {
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

	public include(scopes: string[][]): boolean {
		if (!this.selector) {
			return false;
		}
		return scopes.some(this.match.bind(this) as (s: string | string[]) => boolean);
	}

	public toString(): string {
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
	} catch (e) {
		throw new Error(`'${selector}' is an invalid Textmate scope selector. ${e && (e as Error).message || ''}`.trim());
	}
}

export class TextmateScopeSelectorMap {
	private matchers: Record<string, ScopeSelector>;

	constructor(public readonly sourcemap: Record<string, number> | undefined) {
		this.matchers = {};
		if (typeof sourcemap === 'object' && sourcemap?.constructor === Object) {
			for (const key in sourcemap) {
				if ({}.hasOwnProperty.call(sourcemap, key)) {
					this.matchers[key] = optimizedSelectorFactory(key);
				}
			}
		}
	}

	public key(scopes: string | string[]): string | void {
		if (!this.sourcemap) {
			return void 0;
		}
		for (const key in this.sourcemap) {
			if (this.matchers[key].matches(scopes)) {
				return key;
			}
		}
		return void 0;
	}

	public has(scopes: string | string[]): boolean {
		return typeof this.key(scopes) === 'string';
	}

	public value(scopes: string | string[]): number | void {
		const key = this.key(scopes);
		if (!this.sourcemap || !key) {
			return void 0;
		}
		return this.sourcemap[key];
	}

	public toString(): string {
		return JSON.stringify(this.sourcemap);
	}
}

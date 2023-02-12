'use strict';

export class FastScopeSelector {
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
			const left = target.charAt(position - 1);
			const right = target.charAt(position + this.source.length);

			const isScopeBoundary = (c: string) => ['', '.', ' '].includes(c);
			return (this._cache[target] = [left, right].every(isScopeBoundary));
		}
	}

	getPrefix(_: string | string[]): undefined {
		return void 0;
	}

	getPriority(_: string | string[]): undefined {
		return void 0;
	}

	toString(): string {
		return this.source;
	}
}

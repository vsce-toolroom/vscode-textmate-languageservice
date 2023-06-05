
/* --------------------------------------------------------------------------------------------
 *  Copyright (c) GitHub Inc. All rights reserved.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 * -------------------------------------------------------------------------------------------*/
/* eslint-disable max-classes-per-file */
'use strict';

export type AtomMatcher = SegmentMatcher | TrueMatcher;

export type ParsedMatcher = (
	| PathMatcher
	| CompositeMatcher
	| OrMatcher
	| AndMatcher
	| NegateMatcher
);

export type CompositeOperator = '|' | '&' | '-';

export type GroupPrefix = 'L' | 'R' | 'B';

export type SegmentMatch = [string[], string[]];

export type PrefixMatch = [GroupPrefix, ':'];

export class SegmentMatcher {
	public segment: string;

	constructor(segments: SegmentMatch) {
		this.segment = segments[0].join('') + segments[1].join('');
	}

	public matches(scope: string): boolean {
		return scope === this.segment;
	}

	public getPrefix(_: string): void {
		return void 0;
	}
}

export class TrueMatcher {
	public matches(_: string): boolean {
		return true;
	}

	public getPrefix(_: string[]): void {
		return void 0;
	}
}

export class ScopeMatcher {
	public segments: AtomMatcher[];

	constructor(first: AtomMatcher, others: Array<[[], AtomMatcher]>) {
		this.segments = [first];
		for (const segment of others) {
			this.segments.push(segment[1]);
		}
	}

	public matches(scope: string): boolean {
		const scopeSegments = scope.split('.');
		if (scopeSegments.length < this.segments.length) {
			return false;
		}

		for (let index = 0; index < this.segments.length; index++) {
			const segment = this.segments[index];
			if (!segment.matches(scopeSegments[index])) {
				return false;
			}
		}

		return true;
	}

	public getPrefix(_: string): void {
		return void 0;
	}
}

export class GroupMatcher {
	public prefix?: GroupPrefix;
	public selector: ScopeMatcher;

	constructor(prefix: PrefixMatch | null | undefined, selector: ScopeMatcher) {
		this.prefix = prefix !== null ? prefix[0] : void 0;
		this.selector = selector;
	}

	public matches(scopes: string): boolean {
		return this.selector.matches(scopes);
	}

	public getPrefix(scopes: string): GroupPrefix | void {
		if (this.selector.matches(scopes)) {
			return this.prefix;
		}
	}
}

export class PathMatcher {
	public prefix?: GroupPrefix;
	public matchers: ScopeMatcher[];

	constructor(prefix: PrefixMatch | null | void, first: ScopeMatcher, others: Array<[[], ScopeMatcher]>) {
		this.prefix = prefix ? prefix[0] : undefined;
		this.matchers = [first];
		for (const matcher of others) {
			this.matchers.push(matcher[1]);
		}
	}

	public matches(scopes: string[]): boolean {
		let index = 0;
		let matcher = this.matchers[index];

		for (const scope of scopes) {
			if (matcher.matches(scope)) {
				matcher = this.matchers[++index];
			}

			if (!matcher) {
				return true;
			}
		}

		return false;
	}

	public getPrefix(scopes: string[]): GroupPrefix | void {
		if (this.matches(scopes)) {
			return this.prefix;
		}
	}
}

export class OrMatcher {
	public left: ParsedMatcher;
	public right: ParsedMatcher;

	constructor(left1: ParsedMatcher, right1: ParsedMatcher) {
		this.left = left1;
		this.right = right1;
	}

	public matches(scopes: string[]): boolean {
		return this.left.matches(scopes) || this.right.matches(scopes);
	}

	public getPrefix(scopes: string[]): GroupPrefix | void {
		return this.left.getPrefix(scopes) || this.right.getPrefix(scopes) || undefined;
	}
}

export class AndMatcher {
	public left: PathMatcher;
	public right: PathMatcher | NegateMatcher;

	constructor(left: PathMatcher, right: PathMatcher | NegateMatcher) {
		this.left = left;
		this.right = right;
	}

	public matches(scopes: string[]): boolean {
		return this.left.matches(scopes) && this.right.matches(scopes);
	}

	public getPrefix(scopes: string[]): GroupPrefix | void {
		if (this.left.matches(scopes) && this.right.matches(scopes)) {
			return this.left.getPrefix(scopes); // The right side can't have prefixes
		}
	}
}

export class NegateMatcher {
	public matcher: PathMatcher;

	constructor(matcher: PathMatcher) {
		this.matcher = matcher;
	}

	public matches(scopes: string[]): boolean {
		return !this.matcher.matches(scopes);
	}

	public getPrefix(_: string[]): void {
		return void 0;
	}
}

export class CompositeMatcher {
	public matcher: OrMatcher | AndMatcher;

	constructor(left: PathMatcher, operator: CompositeOperator, right: PathMatcher) {
		switch (operator) {
			case '|':
				this.matcher = new OrMatcher(left, right);
				break;
			case '&':
				this.matcher = new AndMatcher(left, right);
				break;
			case '-':
				this.matcher = new AndMatcher(left, new NegateMatcher(right));
		}
	}

	public matches(scopes: string[]) {
		return this.matcher.matches(scopes);
	}

	public getPrefix(scopes: string[]): GroupPrefix | void {
		return this.matcher.getPrefix(scopes);
	}
}

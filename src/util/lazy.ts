/* --------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 * -------------------------------------------------------------------------------------------*/
'use strict';

export interface Lazy<T> {
	readonly value: T;
	readonly hasValue: boolean;
	map<R>(f: (x: T) => R): Lazy<R>;
}

class LazyValue<T> implements Lazy<T> {
	private _hasValue = false;
	private _value?: T;

	constructor(private readonly _getValue: () => T) { }

	public get value(): T {
		if (!this._hasValue) {
			this._hasValue = true;
			this._value = this._getValue();
		}
		return this._value;
	}

	public get hasValue(): boolean {
		return this._hasValue;
	}

	public map<R>(f: (x: T) => R): Lazy<R> {
		return new LazyValue(() => f(this.value));
	}
}

export function lazy<T>(getValue: () => T): Lazy<T> {
	return new LazyValue<T>(getValue);
}

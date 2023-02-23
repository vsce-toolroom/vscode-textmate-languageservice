'use strict';

import { TextmateScopeSelector, TextmateScopeSelectorMap } from '../util/selectors';

import type { ConfigJson } from './config';

export class ConfigSelectors {
	private _assignment: {
		multiple: TextmateScopeSelector;
		separator: TextmateScopeSelector;
		single: TextmateScopeSelector;
	};
	private _data: ConfigJson;
	private _declarations: TextmateScopeSelector;
	private _dedentation: TextmateScopeSelector;
	private _indentation: TextmateScopeSelectorMap;
	private _punctuation: { continuation: TextmateScopeSelector };
	private _markers: { end: RegExp; start: RegExp };
	private _symbols: TextmateScopeSelectorMap;

	constructor(data: ConfigJson) {
		this._data = Object.assign({}, data);
	}

	public get assignment() {
		return (this._assignment = this._assignment || {
			multiple: new TextmateScopeSelector(this._data.assignment?.multiple),
			separator: new TextmateScopeSelector(this._data.assignment?.separator),
			single: new TextmateScopeSelector(this._data.assignment?.single)
		});
	}
	public get declarations() {
		return (this._declarations = this._declarations || new TextmateScopeSelector(this._data.declarations));
	}
	public get dedentation() {
		return (this._dedentation = this._dedentation || new TextmateScopeSelector(this._data.dedentation));
	}
	public get indentation() {
		return (this._indentation = this._indentation || new TextmateScopeSelectorMap(this._data.indentation));
	}
	public get punctuation() {
		return (this._punctuation = this._punctuation || {
			continuation: new TextmateScopeSelector(this._data.punctuation?.continuation)
		});
	}
	public get markers() {
		const start = this._data.markers?.start;
		const end = this._data.markers?.end;
		return (this._markers = this._markers || {
			end: end ? new RegExp(end) : /.^/,
			start: start ? new RegExp(start) : /.^/
		});
	}
	public get symbols() {
		return (this._symbols = this._symbols || new TextmateScopeSelectorMap(this._data.symbols));
	}
}

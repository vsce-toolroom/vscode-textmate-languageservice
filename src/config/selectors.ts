'use strict';

import type { ConfigJson } from './config';
import { TextmateScopeSelector, TextmateScopeSelectorMap } from '../parser/selectors';

export class ConfigSelectors {
	constructor(data: ConfigJson) {
		this._data = Object.assign({}, data);
	}

	private _data: ConfigJson;
	private _assignment: {
		single: TextmateScopeSelector;
		multiple: TextmateScopeSelector;
		separator: TextmateScopeSelector;
	};
	private _comments: {
		lineComment: TextmateScopeSelector;
		blockComment: TextmateScopeSelector;
	};
	private _declarations: TextmateScopeSelector;
	private _dedentation: TextmateScopeSelector;
	private _indentation: TextmateScopeSelectorMap;
	private _punctuation: {
		continuation: TextmateScopeSelector;
	};
	private _markers: {
		start: RegExp;
		end: RegExp;
	};
	private _symbols: TextmateScopeSelectorMap;

	public get assignment() {
		return (this._assignment = this._assignment || {
			single: new TextmateScopeSelector(this._data.assignment?.single),
			multiple: new TextmateScopeSelector(this._data.assignment?.multiple),
			separator: new TextmateScopeSelector(this._data.assignment?.separator)
		});
	}
	public get comments() {
		return (this._comments = this._comments || {
			lineComment: new TextmateScopeSelector(this._data.comments?.lineComment),
			blockComment: new TextmateScopeSelector(this._data.comments?.blockComment)
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
			start: start ? new RegExp(start) : /.^/,
			end: end ? new RegExp(end) : /.^/
		});
	}
	public get symbols() {
		return (this._symbols = this._symbols || new TextmateScopeSelectorMap(this._data?.symbols));
	}
}

'use strict';

import type * as vscode from 'vscode';
import type { JsonValue, PartialDeep } from 'type-fest';

import { TextmateScopeSelector, TextmateScopeSelectorMap } from './factory';
import { SUBMODULE_NAME } from './files';

type PartialJsonValue = PartialDeep<JsonValue>;

export function jsonify<T = PartialJsonValue>(value: Record<symbol | string | number, any>): T {
	return JSON.parse(JSON.stringify(value, stringifyClasses)) as T;
}

function stringifyClasses(key: string, value: any): any {
	if (value === null || value === undefined) {
		return value;
	}
	if (value && ((value as vscode.Uri).path || key === 'uri')) {
		const filepath = (value as vscode.Uri).path.replace(/\\/g, '/');
		const submoduleNameOffset = (value as vscode.Uri).path.lastIndexOf(SUBMODULE_NAME);
		return '.' + filepath.substring(SUBMODULE_NAME.length + submoduleNameOffset);
	}
	if (value instanceof TextmateScopeSelector) {
		return value.toString();
 	}
	if (value instanceof TextmateScopeSelectorMap) {
		return value.toString();
	}
	return value;
}

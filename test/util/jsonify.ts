'use strict';

import * as vscode from 'vscode';
import type { JsonValue } from 'type-fest';

import { TextmateScopeSelector, TextmateScopeSelectorMap } from '../../src/util/selectors';
import { SUBMODULE_NAME } from './files';

export function jsonify<T = JsonValue>(value: Record<symbol | string | number, any>): T {
	return JSON.parse(JSON.stringify(value, stringifyClasses)) as T;
}

function stringifyClasses(key: string, value: any) {
	if (value === null || value === undefined) return value;
	if (value && (value.path || key === 'uri')) {
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

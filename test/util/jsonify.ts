'use strict';

import * as vscode from 'vscode';
import * as path from 'path';

import type { JsonValue } from 'type-fest';

import { TextmateScopeSelector, TextmateScopeSelectorMap } from '../../src/util/selectors';
import { SUBMODULE_NAME } from './files';

export default function<T = JsonValue>(value: object): T {
	return JSON.parse(JSON.stringify(value, stringifyClasses));
}

function stringifyClasses(key: string, value: any) {
	if (value === null || value === undefined) return value;
	if (value && (value.path || key === 'uri')) {
		const filepath = path.posix.normalize((value as vscode.Uri).path);
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

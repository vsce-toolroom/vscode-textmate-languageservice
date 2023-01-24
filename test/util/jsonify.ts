'use strict';

import * as vscode from 'vscode';
import * as path from 'path';

import type { JsonValue } from 'type-fest';

import { TextmateScopeSelector, TextmateScopeSelectorMap } from '../../src/parser/selectors';

export default function<T = JsonValue>(value: object): T {
	return JSON.parse(JSON.stringify(value, stringifyClasses));
}

function stringifyClasses(key: string, value: any) {
	if (value === null || value === undefined) return value;
	if (value && [String(key).toLowerCase(), Object.getPrototypeOf(value).constructor.name.toLowerCase()].includes('uri')) {
		const filepath = path.posix.normalize((value as vscode.Uri).path);
		return './' + filepath.substring((value as vscode.Uri).path.lastIndexOf('test'));
	}
	if (value instanceof TextmateScopeSelector) {
		return value.toString();
 	}
	if (value instanceof TextmateScopeSelectorMap) {
		return value.toString();
	}
	return value;
}

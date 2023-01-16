'use strict';

import type { JsonValue } from 'type-fest';
import * as vscode from 'vscode';

export default function<T = JsonValue>(value: object): T {
	return JSON.parse(JSON.stringify(value, convertUriToPortablePath));
}

function convertUriToPortablePath(key: string | symbol | number, value: any) {
	return valueisUri(key, value) ? `./${portableTestPath(value.path)}` : value;
}

function portableTestPath(path: string) {
	return path.replace(/\\/g, '/').match(/test\/\w+\/\w+\.\w+$/)?.[0];
}

function valueisUri(key: string | symbol | number, value: any): value is vscode.Uri {
	return key === 'uri' && typeof value?.path === 'string';
}

'use strict';

import * as vscode from 'vscode';
import * as path from 'path';
import type { JsonValue, PartialDeep } from 'type-fest';

import { TextmateScopeSelector, TextmateScopeSelectorMap } from './common';

type PartialJsonValue = PartialDeep<JsonValue>;

export function jsonify<T = PartialJsonValue>(value: Record<symbol | string | number, any>): T {
	return JSON.parse(JSON.stringify(value, replaceClassesWithStrings)) as T;
}

function replaceClassesWithStrings(key: string, value: any): any {
	if (value === null || value === undefined) {
		return value;
	}

	// Internal {@link vscode.Uri} class has the constructor type Object.
	// Sometimes numerous fields are missing also.
	if (['', 'uri'].includes(key) && !!value && typeof value === 'object' && 'path' in value) {
		const externalPath = getNormalizedPathFor(value as vscode.Uri);
		const extensionDevelopmentUri = vscode.extensions.all[vscode.extensions.all.length - 1].extensionUri;
		const extensionPath = getNormalizedPathFor(extensionDevelopmentUri);
		return './' + path.posix.relative(extensionPath, externalPath);
	}

	if (value instanceof TextmateScopeSelector) {
		return value.toString();
	}

	if (value instanceof TextmateScopeSelectorMap) {
		return value.toString();
	}

	return value;
}

/**
 * Corrects inconsistent drive letters in {@link @vscode.Uri} factories.
 * @param {vscode.Uri} file URI object with a `path` property.
 * @returns {string} Normalized path property.
 */
function getNormalizedPathFor(file: vscode.Uri) {
	const filepath = path.posix.normalize(file.path);

	const driveLetterIndex = filepath.indexOf('/', 1);

	if (driveLetterIndex >= 5) {
		return filepath;
	}

	const driveLetter = filepath.substring(0, driveLetterIndex).toLowerCase();
	const fileSystemPath = filepath.substring(driveLetterIndex);

	return `${driveLetter}${fileSystemPath}`;
}

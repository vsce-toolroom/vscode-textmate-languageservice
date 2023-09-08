/// <reference path="../../../typings/token-information.api.d.ts" />
/// <reference path="../../../typings/context.d.ts" />

'use strict';

import * as vscode from 'vscode';

import { strictEqual } from '../../util/assert';
import TextmateLanguageService from '../../../src/main';
import { documentServicePromise, tokenServicePromise } from '../../util/factory';
import { BASENAMES, getSampleFileUri } from '../../util/files';
import { TextmateScopeSelector } from '../../util/common';

const { getScopeInformationAtPosition, getScopeRangeAtPosition, getTokenInformationAtPosition } = TextmateLanguageService.api;
let titleData: Awaited<ReturnType<typeof getTitleData>>;

type TextmateScopeSelectorType = typeof TextmateScopeSelector.prototype;

const languageScopeMap: Record<string, string> = {
	'mediawiki': 'string.quoted.other.heading.mediawiki',
	'matlab': 'entity.name.type.class.matlab',
	'typescript': 'entity.name.type.class.ts',
};

const languageSelectorMap: Record<string, TextmateScopeSelectorType> =
	Object.fromEntries(
		Object.entries(languageScopeMap)
		.map(([k, v]) => [k, new TextmateScopeSelector(v)])
	);

const languageStandardTypeMap = {
	'mediawiki': vscode.StandardTokenType.String,
	'matlab': vscode.StandardTokenType.Other,
	'typescript': vscode.StandardTokenType.Other,
};

suite('test/api/tokenInformation.test.ts (src/api.ts)', async function() {
	this.timeout(5000);

	this.beforeAll(async function() {
		titleData = await getTitleData();
	})

	test('getScopeInformationAtPosition(): Promise<TextmateToken>', async function() {
		if (globalThis.languageId === 'mediawiki') {
			this.skip();
		}

		vscode.window.showInformationMessage('API `getScopeInformationAtPosition` method (src/api.ts)');

		const scopeInformation = await getScopeInformationAtPosition(titleData.document, titleData.position);

		strictEqual(scopeInformation.line, 0);
		strictEqual(scopeInformation.text, titleData.basename);

		strictEqual(scopeInformation.startIndex, titleData.token.startIndex);
		strictEqual(scopeInformation.endIndex, titleData.token.endIndex);

		strictEqual(scopeInformation.level, 0);

		const scopeType = languageScopeMap[globalThis.languageId];
		strictEqual(scopeInformation.type, scopeType);			
	});

	test('getScopeRangeAtPosition(): Promise<TextmateToken>', async function() {
		if (globalThis.languageId === 'mediawiki') {
			this.skip();
		}

		vscode.window.showInformationMessage('API `getScopeRangeAtPosition` method (src/api.ts)');

		const scopeRange = await getScopeRangeAtPosition(titleData.document, titleData.position);
		strictEqual(scopeRange.isEqual(titleData.range), true);
	});

	test('getScopeInformationAtPosition(): Promise<TextmateToken>', async function() {
		if (globalThis.languageId === 'mediawiki') {
			this.skip();
		}

		vscode.window.showInformationMessage('API `getScopeInformationAtPosition` method (src/api.ts)');

		const tokenInformation = await getTokenInformationAtPosition(titleData.document, titleData.position);
		strictEqual(tokenInformation.range.isEqual(titleData.range), true);

		const standardType = languageStandardTypeMap[globalThis.languageId];
		strictEqual(tokenInformation.type, standardType);	
	});
});

async function getTitleData() {
	const documentService = await documentServicePromise;
	const tokenService = await tokenServicePromise;

	const basename = BASENAMES[globalThis.languageId][0];
	const resource = getSampleFileUri(basename);

	const document = await documentService.getDocument(resource);
	const tokens = await tokenService.fetch(document);

	const selector = languageSelectorMap[globalThis.languageId];
	const token = tokens.find(t => t.line === 0 && selector.match(t.scopes));

	if (!token) {
		throw new Error('no title symbol present on first line');
	}

	const position = new vscode.Position(token.line, token.startIndex);
	const range = new vscode.Range(token.line, token.startIndex, token.line, token.endIndex);

	return { basename, document, position, range, token };
}

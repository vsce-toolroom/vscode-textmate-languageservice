/// <reference path="../../../typings/context.d.ts" />

'use strict';

import * as vscode from 'vscode';

import { strictEqual } from '../../util/assert';
import TextmateLanguageService from '../../../src/main';

const { getGrammarConfiguration, getLanguageConfiguration, getContributorExtension } = TextmateLanguageService.api;

const languageExtensionMap: Record<string, string> = {
	'mediawiki': '.mediawiki',
	'matlab': '.m',
	'typescript': '.ts',
};

const languageScopeNameMap: Record<string, string> = {
	'mediawiki': 'text.html.mediawiki',
	'matlab': 'source.matlab',
	'typescript': 'source.ts',
};

const languageContributorMap: Record<string, string> = {
	'mediawiki': 'sndst00m.mediawiki',
	'matlab': 'Gimly81.matlab',
	'typescript': 'vscode.typescript'
}

suite('test/api/languageConfiguration.test.ts (src/api.ts)', async function() {
	this.timeout(5000);

	test('getLanguageConfiguration(): LanguagePoint', async function() {
		if (globalThis.languageId === 'mediawiki') {
			this.skip();
		}

		vscode.window.showInformationMessage('API `getScopeInformationAtPosition` method (src/api.ts)');

		const languageConfiguration = getLanguageConfiguration(globalThis.languageId);

		strictEqual(languageConfiguration.id, globalThis.languageId);

		const languageFileExtension = languageExtensionMap[globalThis.languageId];
		strictEqual(languageConfiguration.extensions?.includes(languageFileExtension), true);
	});

	test('getGrammarConfiguration(): GrammarLanguagePoint', async function() {
		if (globalThis.languageId === 'mediawiki') {
			this.skip();
		}

		vscode.window.showInformationMessage('API `getScopeInformationAtPosition` method (src/api.ts)');

		const grammarConfiguration = getGrammarConfiguration(globalThis.languageId);

		strictEqual(grammarConfiguration.language, globalThis.languageId);

		const languageScopeName = languageScopeNameMap[globalThis.languageId]
		strictEqual(grammarConfiguration.scopeName, languageScopeName);
	});

	test('getContributorExtension(): vscode.Extension | void', async function () {
		if (globalThis.languageId === 'mediawiki') {
			this.skip();
		}

		vscode.window.showInformationMessage('API `getContributorExtension` method (src/api.ts)');

		const extension = getContributorExtension(globalThis.languageId);

		strictEqual(typeof extension === 'object', true);

		const languageContributorId = languageContributorMap[globalThis.languageId];
		strictEqual((extension as vscode.Extension<unknown>).id, languageContributorId);
	});
});

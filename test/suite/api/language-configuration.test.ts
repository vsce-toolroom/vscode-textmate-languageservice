/// <reference path="../../../typings/context.d.ts" />

'use strict';

import * as vscode from 'vscode';

import { strictEqual } from '../../util/assert';
import TextmateLanguageService from '../../../src/main';

const { getGrammarConfiguration, getLanguageConfiguration, getContributorExtension } = TextmateLanguageService.api;

const languageExtensionMap: Record<string, string> = {
	'mediawiki': '.txt',
	'matlab': '.m',
	'typescript': '.ts',
};

const languageScopeNameMap: Record<string, string> = {
	'mediawiki': 'text',
	'matlab': 'source.matlab',
	'typescript': 'source.ts',
};

const languageContributorMap: Record<string, string> = {
	'mediawiki': void 0,
	'matlab': 'Gimly81.matlab',
	'typescript': 'vscode.typescript'
}

const languageId = globalThis.languageId === 'mediawiki' ? 'plaintext' : globalThis.languageId;

suite('test/api/languageConfiguration.test.ts (src/api.ts)', async function() {
	this.timeout(5000);

	test('getLanguageConfiguration(): LanguageDefinition', async function() {
		vscode.window.showInformationMessage('API `getScopeInformationAtPosition` method (src/api.ts)');

		const languageConfiguration = getLanguageConfiguration(globalThis.languageId);

		strictEqual(languageConfiguration.id, languageId);

		const languageFileExtension = languageExtensionMap[globalThis.languageId];
		strictEqual(languageConfiguration.extensions?.includes(languageFileExtension), true);
	});

	test('getGrammarConfiguration(): GrammarLanguageDefinition', async function() {
		vscode.window.showInformationMessage('API `getScopeInformationAtPosition` method (src/api.ts)');

		const grammarConfiguration = getGrammarConfiguration(globalThis.languageId);

		strictEqual(grammarConfiguration.language, languageId);

		const languageScopeName = languageScopeNameMap[globalThis.languageId]
		strictEqual(grammarConfiguration.scopeName, languageScopeName);
	});

	test('getContributorExtension(): vscode.Extension | void', async function () {
		vscode.window.showInformationMessage('API `getContributorExtension` method (src/api.ts)');

		const extension = getContributorExtension(globalThis.languageId);

		strictEqual(typeof extension === 'object', globalThis.languageId !== 'mediawiki');

		const languageContributorId = languageContributorMap[globalThis.languageId];
		strictEqual((extension || {}).id, languageContributorId);
	});
});

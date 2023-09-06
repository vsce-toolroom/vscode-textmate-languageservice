/// <reference path="../../../typings/context.d.ts" />

'use strict';

import * as vscode from 'vscode';

import { strictEqual } from '../../util/assert';
import TextmateLanguageService from '../../../src/main';

const { getGrammarConfiguration, getLanguageConfiguration } = TextmateLanguageService.api;

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

suite('test/api/languageConfiguration.test.ts (src/api.ts)', async function() {
	if (globalThis.languageId === 'mediawiki') {
		return;
	}

	this.timeout(5000);

	test('getLanguageConfiguration(): LanguagePoint', async function() {
		vscode.window.showInformationMessage('API `getScopeInformationAtPosition` method (src/api.ts)');

		const languageConfiguration = await getLanguageConfiguration(globalThis.languageId);

		strictEqual(languageConfiguration.id, globalThis.languageId);

		const languageFileExtension = languageExtensionMap[globalThis.languageId];
		strictEqual(languageConfiguration.extensions?.includes(languageFileExtension), true);
	});

	test('getGrammarConfiguration(): GrammarLanguagePoint', async function() {
		vscode.window.showInformationMessage('API `getScopeInformationAtPosition` method (src/api.ts)');

		const grammarConfiguration = await getGrammarConfiguration(globalThis.languageId);

		strictEqual(grammarConfiguration.language, globalThis.languageId);

		const languageScopeName = languageScopeNameMap[globalThis.languageId]
		strictEqual(grammarConfiguration.scopeName, languageScopeName);
	});
});

/// <reference path="../../../typings/context.d.ts" />

'use strict';

import * as vscode from 'vscode';

import { strictEqual } from '../../util/assert';
import TextmateLanguageService from '../../../src/main';
import { jsonify } from '../../util/jsonify';
import { isWebRuntime } from '../../util/runtime';

const { getGrammarContribution, getLanguageContribution, getLanguageConfiguration, getContributorExtension } = TextmateLanguageService.api;

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

	test('getLanguageConfiguration(): Promise<vscode.LanguageConfiguration>', async function() {

		vscode.window.showInformationMessage('API `getLanguageConfiguration` method (src/api.ts)');

		const languageConfiguration = await getLanguageConfiguration(globalThis.languageId);

		if (isWebRuntime) {
			console.log(jsonify(languageConfiguration));
		}

		strictEqual(languageConfiguration.wordPattern instanceof RegExp, globalThis.languageId === 'typescript');

		strictEqual(Array.isArray(languageConfiguration.brackets), true);

		strictEqual(Array.isArray(languageConfiguration.comments.blockComment), true);
	});

	test('getLanguageContribution(): LanguageDefinition', async function() {
		vscode.window.showInformationMessage('API `getScopeInformationAtPosition` method (src/api.ts)');

		const languageContribution = getLanguageContribution(globalThis.languageId);

		strictEqual(languageContribution.id, globalThis.languageId);

		const languageFileExtension = languageExtensionMap[globalThis.languageId];
		strictEqual(languageContribution.extensions?.includes(languageFileExtension), true);
	});

	test('getGrammarContribution(): GrammarLanguageDefinition', async function() {
		vscode.window.showInformationMessage('API `getScopeInformationAtPosition` method (src/api.ts)');

		const grammarContribution = getGrammarContribution(globalThis.languageId);

		strictEqual(grammarContribution.language, globalThis.languageId);

		const languageScopeName = languageScopeNameMap[globalThis.languageId]
		strictEqual(grammarContribution.scopeName, languageScopeName);
	});

	test('getContributorExtension(): vscode.Extension | void', async function () {
		vscode.window.showInformationMessage('API `getContributorExtension` method (src/api.ts)');

		const extension = getContributorExtension(globalThis.languageId);

		strictEqual(typeof extension === 'object', true);

		const languageContributorId = languageContributorMap[globalThis.languageId];
		strictEqual((extension || {}).id, languageContributorId);
	});
});

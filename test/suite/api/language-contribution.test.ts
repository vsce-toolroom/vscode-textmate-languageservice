/// <reference path="../../../typings/context.d.ts" />

'use strict';

import * as vscode from 'vscode';

import { strictEqual } from '../../util/assert';
import TextmateLanguageService from '../../../src/main';

const {
	getGrammarContribution,
	getLanguageContribution,
	getLanguageConfiguration,
	getContributorExtension
} = TextmateLanguageService.api;

const languageExtensionMap: Record<string, string> = {
	matlab: '.m',
	mediawiki: '.mediawiki',
	typescript: '.ts',
};

const languageScopeNameMap: Record<string, string> = {
	matlab: 'source.matlab',
	mediawiki: 'text.html.mediawiki',
	typescript: 'source.ts',
};

const languageContributorMap: Record<string, string> = {
	matlab: 'Gimly81.matlab',
	mediawiki: 'sndst00m.mediawiki',
	typescript: 'vscode.typescript'
};

suite('test/api/language-contribution.test.ts (src/api.ts)', function() {
	this.timeout(5000);

	test('getLanguageConfiguration(): Promise<vscode.LanguageConfiguration>', async function() {
		void vscode.window.showInformationMessage('API `getLanguageConfiguration` method (src/api.ts)');

		const languageConfiguration = await getLanguageConfiguration(globalThis.languageId);

		strictEqual(languageConfiguration.wordPattern instanceof RegExp, globalThis.languageId === 'typescript');

		strictEqual(Array.isArray(languageConfiguration.brackets), true);

		strictEqual(Array.isArray(languageConfiguration.comments.blockComment), true);
	});

	test('getLanguageContribution(): LanguageDefinition', function() {
		void vscode.window.showInformationMessage('API `getScopeInformationAtPosition` method (src/api.ts)');

		const languageContribution = getLanguageContribution(globalThis.languageId);

		strictEqual(languageContribution.id, globalThis.languageId);

		const languageFileExtension = languageExtensionMap[globalThis.languageId];
		strictEqual(languageContribution.extensions?.includes(languageFileExtension), true);
	});

	test('getGrammarContribution(): GrammarLanguageDefinition', function() {
		void vscode.window.showInformationMessage('API `getScopeInformationAtPosition` method (src/api.ts)');

		const grammarContribution = getGrammarContribution(globalThis.languageId);

		strictEqual(grammarContribution.language, globalThis.languageId);

		const languageScopeName = languageScopeNameMap[globalThis.languageId];
		strictEqual(grammarContribution.scopeName, languageScopeName);
	});

	test('getContributorExtension(): vscode.Extension | void', function() {
		void vscode.window.showInformationMessage('API `getContributorExtension` method (src/api.ts)');

		const extension = getContributorExtension(globalThis.languageId);

		strictEqual(typeof extension === 'object', true);

		const languageContributorId = languageContributorMap[globalThis.languageId];
		strictEqual((extension || {}).id, languageContributorId);
	});
});

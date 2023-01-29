'use strict';

import * as vscode from 'vscode';
import * as assert from 'assert';

import { loadJsonFile } from '../../src/util/loader';
import { TextmateScopeSelector, TextmateScopeSelectorMap } from '../../src/util/selectors';
import { SELECTOR_TEST_DATA_BASENAME, SELECTOR_MAP_TEST_DATA_BASENAME, geComponentDataUri } from '../util/files';

suite('src/util/selectors.ts (test/suite/selectors.util.test.ts)', async function() {
	this.timeout(10000);

	test('TextmateScopeSelector class', async function() {
		vscode.window.showInformationMessage('TextmateScopeSelector class (src/utils/selectors.ts)');

		const scopeSelectorTestsUri = geComponentDataUri('selectors', SELECTOR_TEST_DATA_BASENAME);
		type ScopeSelectorData = typeof import('../data/selectors/selector.json');
		const scopeSelectorTests = await loadJsonFile<ScopeSelectorData>(scopeSelectorTestsUri);
	
		const testSuite = Object.values(scopeSelectorTests);
		for (let index = 0; index < testSuite.length; index++) {
			const testCases = testSuite[index];
			for (let subindex = 0; subindex < testCases.length; subindex++) {
				const test = testCases[subindex];
				const selector = new TextmateScopeSelector(test.selector);
				const scopes = typeof test.input === 'string'? test.input : test.input.join(' ');
				assert.strictEqual(
					selector.match(test.input),
					test.expected,
					`TextmateScopeSelector.match: '${test.selector}' failed for the input: '${scopes}'.`
				);
			}
		}
	});
	test('TextmateScopeSelectorMap class', async function() {
		vscode.window.showInformationMessage('TextmateScopeSelectorMap class (src/utils/selectors.ts)');

		const scopeSelectorMapTestsUri = geComponentDataUri('selectors', SELECTOR_MAP_TEST_DATA_BASENAME);
		type ScopeSelectorMapData = typeof import('../data/selectors/map.json');
		const scopeSelectorMapTests = await loadJsonFile<ScopeSelectorMapData>(scopeSelectorMapTestsUri);
	
			const testCases = Object.values(scopeSelectorMapTests);
		for (let index = 0; index < testCases.length; index++) {
			const test = testCases[index];
			const selectorMap = new TextmateScopeSelectorMap({ [test.key]: test.value });
			const scopes = typeof test.input === 'string'? test.input : test.input.join(' ');
			assert.strictEqual(
				selectorMap.key(test.input),
				test.key === null ? undefined : test.key,
				`TextmateScopeSelectorMap.key: "${test.key}":${test.value}} failed for the input: "${scopes}".`
			);
			assert.strictEqual(
				selectorMap.has(test.input),
				test.expected,
				`TextmateScopeSelectorMap.has: "${test.key}":${test.value}} failed for the input: "${scopes}".`
			);
			assert.strictEqual(
				selectorMap.value(test.input),
				test.value === null ? undefined : test.value,
				`TextmateScopeSelectorMap.value: {"${test.key}":${test.value}} failed for the input: "${scopes}".`
			);
		}
	});
});

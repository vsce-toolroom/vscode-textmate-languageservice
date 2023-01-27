'use strict';

import * as path from 'path';
import * as vscode from 'vscode';
import * as assert from 'assert';
import * as loadJsonFile from 'load-json-file';

import { TextmateScopeSelector, TextmateScopeSelectorMap } from '../../../src/util/selectors';

const scopeTestsPath = path.resolve(__dirname, '../../../../../../data/selectors');
const scopeSelectorTests = loadJsonFile.sync(path.resolve(scopeTestsPath, 'TextmateScopeSelector.json'));
const scopeSelectorMapTests = loadJsonFile.sync(path.resolve(scopeTestsPath, 'TextmateScopeSelectorMap.json'));

suite('src/parser/selectors.ts (test/suite/parser/selectors.ts)', function() {
	this.timeout(10000);
	test('TextmateScopeSelector class', function() {
		vscode.window.showInformationMessage('TextmateScopeSelector class (src/parser/selectors.ts)');

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
	test('TextmateScopeSelectorMap class', function() {
		vscode.window.showInformationMessage('TextmateScopeSelectorMap class (src/parser/selectors.ts)');

		const testSuite = Object.values(scopeSelectorMapTests);
		for (let index = 0; index < testSuite.length; index++) {
			const testCases = testSuite[index];
			for (let subindex = 0; subindex < testCases.length; subindex++) {
				const test = testCases[subindex];
				const selectorMap = new TextmateScopeSelectorMap(test.selector);
				const scopes = typeof test.input === 'string'? test.input : test.input.join(' ');
				assert.strictEqual(
					selectorMap.key(test.input),
					test.key === null ? undefined : test.key,
					`TextmateScopeSelectorMap.key: '${test.selector}' failed for the input: '${scopes}'.`
				);
				assert.strictEqual(
					selectorMap.has(test.input),
					test.expected,
					`TextmateScopeSelectorMap.has: '${test.selector}' failed for the input: '${scopes}'.`
				);
				assert.strictEqual(
					selectorMap.value(test.input),
					test.value === null ? undefined : test.value,
					`TextmateScopeSelectorMap.value: '${test.selector}' failed for the input: '${scopes}'.`
				);
			}
		}
	});
});

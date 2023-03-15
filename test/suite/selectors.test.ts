'use strict';

import * as vscode from 'vscode';
import { strictEqual } from '../util/assert';

import { getComponentSampleDataUri } from '../util/files';
import { matlabContext, loadJsonFile, TextmateScopeSelector, TextmateScopeSelectorMap } from '../util/factory';

// Add types for JSON test data to ease development.
import type * as selectorJson from '../data/selectors/selector.json';
type SelectorTestData = typeof selectorJson;
import type * as mapJson from '../data/selectors/map.json';
type SelectorMapTestData = typeof mapJson;

suite('test/suite/selectors.util.test.ts - TextmateScopeSelector class (src/util/selectors.ts)', async function() {
	test('TextmateScopeSelector.match(scopes) - Macromates spec', async function() {
		vscode.window.showInformationMessage('TextmateScopeSelector class (src/utils/selectors.ts)');
		const tests = await scopeInput();

		for (const [feature, cases] of tests) {
			for (const t of cases) {
				const selector = new TextmateScopeSelector(t.selector);
				strictEqual(selector.match(t.input), t.expected, `TextmateScopeSelector ${feature}: "${t.selector}"`);
			}
		}
	});
});

async function scopeInput() {
	const data = getComponentSampleDataUri.call(matlabContext, 'selectors', 'selector');
	const json = await loadJsonFile<SelectorTestData>(data);
	const tests = Object.entries(json);
	return tests;
}

suite('test/suite/selectors.util.test.ts - TextmateScopeSelectorMap class (src/utils/selectors.ts)', function() {
	test('TextmateScopeSelectorMap.key(scopes)', async function() {
		vscode.window.showInformationMessage('TextmateScopeSelectorMap class (src/utils/selectors.ts)');
		const testCases = await mapInput();
	
		for (const t of testCases) {
			strictEqual(
				t.map.key(t.input),
				t.key === null ? void 0 : t.key,
				'TextmateScopeSelectorMap.key; sourcemap: ' + t.map.toString() + ', scopes: "' + t.scopes + '"'
			);
		}
	});

	test('TextmateScopeSelectorMap.has(scopes)', async function() {
		const testCases = await mapInput();
		for (const t of testCases) {
			strictEqual(
				t.map.has(t.input),
				t.expected,
				'TextmateScopeSelectorMap.has; sourcemap "' + t.map.toString() + '", scopes: "' + t.scopes + '"'
			);
		}
	});

	test('TextmateScopeSelectorMap.value(scopes)', async function() {
		const testCases = await mapInput();
		for (const t of testCases) {
			strictEqual(
				t.map.value(t.input),
				t.value === null ? void 0 : t.value,
				'TextmateScopeSelectorMap.value; sourcemap: "' + t.map.toString() + '", scopes: "' + t.scopes + '"'
			);
		}
	});
});

async function mapInput() {
	const data = getComponentSampleDataUri.call(matlabContext, 'selectors', 'map');
	const json = await loadJsonFile<SelectorMapTestData>(data);

	type SelectorMapTestDatum = SelectorMapTestData[number];
	interface SelectorMapTestCase extends Pick<SelectorMapTestDatum, 'input' | 'expected'> {
		key: string | void;
		value: number | void;
		map: typeof TextmateScopeSelectorMap.prototype;
		scopes: string;
	}

	const testCases: SelectorMapTestCase[] = [];
	for (const d of json) {
		const key = d.key === null ? void 0 : d.key;
		const value = d.value === null ? void 0 : d.value;
		const map = new TextmateScopeSelectorMap(d.key === null ? void 0 : { [d.key]: d.value });
		const scopes = d.input.join(' ');
		testCases.push({ ...d, key, value, map, scopes });
	}

	return testCases;
}

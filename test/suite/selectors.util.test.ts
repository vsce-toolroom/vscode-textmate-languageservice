'use strict';

import * as vscode from 'vscode';
import * as assert from 'assert';

import { getComponentSampleDataUri } from '../util/files';
import { context, loadJsonFile, TextmateScopeSelector, TextmateScopeSelectorMap } from '../util/factory';

// Add types for JSON test data to ease development.
import type * as selectorJson from 'test/data/selectors/selector.json';
type SelectorTestData = typeof selectorJson;
import type * as mapJson from 'test/data/selectors/map.json';
type SelectorMapTestData = typeof mapJson;

suite('src/util/selectors.ts', function() {

	suite('TextmateScopeSelector class', async function() {
		vscode.window.showInformationMessage('TextmateScopeSelector class (src/utils/selectors.ts)');

		const data = getComponentSampleDataUri.call(context, 'selectors', 'selector');
		const json = await loadJsonFile<SelectorTestData>(data);
	
		const testEntries = Object.entries(json);
		for (const [testFeature, testCases] of testEntries) {
			test('TextmateScopeSelector.match(scopes): selector ' + testFeature, function() {
				for (const t of testCases) {
					const selector = new TextmateScopeSelector(t.selector);
					assert.strictEqual(selector.match(t.input), t.expected);
				}
			});
		}
	});

	suite('TextmateScopeSelectorMap class', async function() {
		vscode.window.showInformationMessage('TextmateScopeSelectorMap class (src/utils/selectors.ts)');

		const data = getComponentSampleDataUri.call(context, 'selectors', 'map');
		const json = await loadJsonFile<SelectorMapTestData>(data);

		type SelectorMapTestDatum = SelectorMapTestData[number];
		interface SelectorMapTestCase extends Pick<SelectorMapTestDatum, 'input' | 'expected'> {
			key: string | void;
			value: number | void;
			map: any; // TODO: use TextmateScopeSelectorMap instead of any
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

		test('key(scopes)', function() {
			for (const t of testCases) {
				test('sourcemap: ' + t.map.toString() + ', scopes: "' + t.scopes + '"', function() {
					assert.strictEqual(t.map.key(t.input), t.key === null ? void 0 : t.key);
				});
			}
		});

		test('has(scopes)', function() {
			for (const t of testCases) {
				test('sourcemap "' + t.map.toString() + '", scopes: "' + t.scopes + '"', function() {
					assert.strictEqual(t.map.has(t.input), t.expected);
				});
			}
		});

		test('value(scopes)', function() {
			for (const t of testCases) {
				test('sourcemap: "' + t.map.toString() + '", scopes: "' + t.scopes + '"', function() {
					assert.strictEqual(t.map.value(t.input), t.value === null ? void 0 : t.value);
				});
			}
		});
	});

});

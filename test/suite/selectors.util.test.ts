'use strict';

import * as vscode from 'vscode';
import { describe, test, expect } from '@jest/globals';

import { loadJsonFile } from '../../src/util/loader';
import { TextmateScopeSelector, TextmateScopeSelectorMap } from '../../src/util/selectors';

import { getComponentSampleDataUri } from '../util/files';
import { context } from '../util/factory';

// Add types for JSON test data to ease development.
import type * as selectorJson from '../data/selectors/selector.json';
type SelectorTestData = typeof selectorJson;
import type * as mapJson from '../data/selectors/map.json';
type SelectorMapTestData = typeof mapJson;

describe('src/util/selectors.ts', function() {

	describe('TextmateScopeSelector class', async function() {
		vscode.window.showInformationMessage('TextmateScopeSelector class (src/utils/selectors.ts)');

		const data = getComponentSampleDataUri.call(context, 'selectors', 'selector');
		const json = await loadJsonFile<SelectorTestData>(data);
	
		const testEntries = Object.entries(json);
		for (const [testFeature, testCases] of testEntries) {
			test('TextmateScopeSelector.match(scopes): selector ' + testFeature, function() {
				for (const t of testCases) {
					test(t.selector, function() {
						const selector = new TextmateScopeSelector(t.selector);
						expect(selector.match(t.input)).toEqual(t.expected);
					});
				}
			});
		}
	});

	describe('TextmateScopeSelectorMap class', async function() {
		vscode.window.showInformationMessage('TextmateScopeSelectorMap class (src/utils/selectors.ts)');

		const data = getComponentSampleDataUri.call(context, 'selectors', 'map');
		const json = await loadJsonFile<SelectorMapTestData>(data);

		type SelectorMapTestDatum = SelectorMapTestData[number];
		interface SelectorMapTestCase extends Pick<SelectorMapTestDatum, 'input' | 'expected'> {
			key: string | void;
			value: number | void;
			map: TextmateScopeSelectorMap;
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
					expect(t.map.key(t.input)).toStrictEqual(t.key === null ? void 0 : t.key);
				});
			}
		});

		test('has(scopes)', function() {
			for (const t of testCases) {
				test('sourcemap "' + t.map.toString() + '", scopes: "' + t.scopes + '"', function() {
					expect(t.map.has(t.input)).toStrictEqual(t.expected);
				});
			}
		});

		test('value(scopes)', function() {
			for (const t of testCases) {
				test('sourcemap: "' + t.map.toString() + '", scopes: "' + t.scopes + '"', function() {
					expect(t.map.value(t.input)).toStrictEqual(t.value === null ? void 0 : t.value);
				});
			}
		});
	});

});

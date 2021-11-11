import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import * as glob from 'glob';
import * as assert from 'assert';
import * as writeJsonFile from 'write-json-file';
import * as loadJsonFile from 'load-json-file';
import { TextmateEngine, TextmateScopeSelector, TextmateScopeSelectorMap } from '../../src/textmateEngine';
import { WorkspaceDocumentProvider } from '../../src/workspaceSymbolProvider';

const selectorsPath = path.resolve(__dirname, '../data/selectors.json');
const selectors = JSON.parse(fs.readFileSync(selectorsPath).toString());

const engine = new TextmateEngine('matlab', 'source.matlab');
const workspaceDocumentProvider = new WorkspaceDocumentProvider('matlab');

suite('src/textmateEngine.ts', function() {
	this.timeout(30000);
	test('TextmateEngine class', async function() {
		glob(path.resolve(__dirname, '../../../test/vscode-matlab/syntaxes/MATLAB-Language-grammar/test/snap/*.m'), async function(e, files) {
			if (e) {
				throw e;
			}
			for (const file of files) {
				const resource = vscode.Uri.file(file);
				const p = path.resolve(__dirname, '../data/textmateEngine', path.basename(file));
				const document = await workspaceDocumentProvider.getDocument(resource);
				const tokens = engine.tokenize('source.matlab', document);
				if (fs.existsSync(p)) {
					assert.deepEqual(loadJsonFile.sync(p), tokens);
				}
				writeJsonFile.sync(p, tokens, { indent: '  ' });
			}
		});
	});
	test('TextmateScopeSelector class', function() {
		Object.keys(selectors).forEach(function(type) {
			selectors[type].forEach(function(test) {
				const selector = new TextmateScopeSelector(test.selector);
				assert.strictEqual(selector.match(test.input), test.expected, `'${test.selector}' failed`);
			})
		});
	});
	test('TextmateScopeSelectorMap class', function() {
		const maps = {};
		const trueMaps = {};
		const falseMaps = {};
		Object.keys(selectors).forEach(function(type) {
			selectors[type].forEach(function(test, i) {
				maps[type] = {}
				maps[type][test.selector] = i;
				if (test.expected === true) {
					trueMaps[type] = trueMaps[type] || {};
					trueMaps[type][test.selector] = i;
				} else {
					falseMaps[type] = falseMaps[type] || {};
					falseMaps[type][test.selector] = i;
				}
			});
			const mapSelector = new TextmateScopeSelectorMap(maps[type]);
			const trueMapSelector = new TextmateScopeSelectorMap(trueMaps[type]);
			const falseMapSelector = new TextmateScopeSelectorMap(falseMaps[type]);
			selectors[type].forEach(function(test, i) {
				assert.strictEqual(mapSelector.has(test.input), test.expected, `'${test.selector}' map.has failed`);
				assert.strictEqual(mapSelector.key(test.input), test.selector, `'${test.selector}' map.key failed`);
				assert.strictEqual(mapSelector.value(test.input), i, `'${test.selector}' map.value failed`);
				if (test.expected === true) {
					assert.strictEqual(trueMapSelector.has(test.input), true, `'${test.selector}' trueMap.has failed`);
					assert.strictEqual(falseMapSelector.has(test.input), false, `'${test.selector}' falseMap.has failed`);
					assert.strictEqual(trueMapSelector.key(test.input), test.selector, `'${test.selector}' trueMap.key failed`);
					assert.strictEqual(trueMapSelector.value(test.input), i, `'${test.selector}' trueMap.value failed`);
				} else {
					assert.strictEqual(falseMapSelector.has(test.input), true, `'${test.selector}' falseMap.has failed`);
					assert.strictEqual(trueMapSelector.has(test.input), false, `'${test.selector}' trueMap.has failed`);
					assert.strictEqual(falseMapSelector.key(test.input), test.selector, `'${test.selector}' falseMap.key failed`);
					assert.strictEqual(falseMapSelector.value(test.input), i, `'${test.selector}' falseMap.value failed`);
				}
			});
		});
	});
});

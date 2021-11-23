import vscode from 'vscode';
import path from 'path';
import fs from 'fs';
import glob from 'glob';
import deepEqual from 'deep-equal';
import assert from 'assert';
import writeJsonFile from 'write-json-file';
import loadJsonFile from 'load-json-file';
import { TextmateEngine, TextmateScopeSelector, configurationData, TextmateScopeSelectorMap } from '../../src/textmateEngine';
import { WorkspaceDocumentProvider } from '../../src/workspaceSymbolProvider';

const textmateEngineTestsPath = path.resolve(__dirname, '../data/textmateEngine');
const textmateScopeSelectorTests = loadJsonFile.sync(path.resolve(textmateEngineTestsPath, 'TextmateScopeSelector.json'));
const textmateScopeSelectorMapTests = loadJsonFile.sync(path.resolve(textmateEngineTestsPath, 'TextmateScopeSelectorMap.json'));

const engine = new TextmateEngine('matlab', 'source.matlab');
const workspaceDocumentProvider = new WorkspaceDocumentProvider('matlab');

suite('src/textmateEngine.ts', function() {
	this.timeout(30000);
	test('TextmateEngine class', async function() {
		const files = glob.sync(path.resolve(__dirname, '../../../../../syntaxes/MATLAB-Language-grammar/test/snap/*.m'));
		for (const file of files) {
			const resource = vscode.Uri.file(file);
			const p = path
				.resolve(__dirname, '../data/textmateEngine', path.basename(file))
				.replace(/\.m$/, '.json');
			const document = await workspaceDocumentProvider.getDocument(resource);
			const tokens = await engine.tokenize('source.matlab', document);
			if (fs.existsSync(p)) {
				deepEqual(loadJsonFile.sync(p), tokens);
			}
			writeJsonFile.sync(p, tokens, { indent: '  ' });
		}
	});
	test('TextmateScopeSelector class', function() {
		for (const [type, tests] of Object.entries(textmateScopeSelectorTests)) {
			for (const test of tests) {
				const selector = new TextmateScopeSelector(test.selector);
				assert.strictEqual(
					selector.match(test.input),
					test.expected,
					`'${test.selector}' failed for the input: '${test.input.join(' ')}'`
				);
			}
		}
	});
	test('TextmateScopeSelectorMap class', function() {
		for (const tests of Object.values(textmateScopeSelectorMapTests)) {
			for (const test of tests) {
				const selectorMap = new TextmateScopeSelectorMap(test.selector);
				assert.strictEqual(
					selectorMap.key(test.input),
					test.key,
					`TextmateScopeSelectorMap.key: '${test.selector}' failed for the input: '${test.input.join(' ')}'`
				);
				assert.strictEqual(
					selectorMap.has(test.input),
					test.expected,
					`TextmateScopeSelectorMap.has: '${test.selector}' failed for the input: '${test.input.join(' ')}'`
				);
				assert.strictEqual(
					selectorMap.value(test.input),
					test.value,
					`TextmateScopeSelectorMap.value: '${test.selector}' failed for the input: '${test.input.join(' ')}'`
				);
			}
		}
	});
});

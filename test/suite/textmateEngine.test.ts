import vscode from 'vscode';
import path from 'path';
import fs from 'fs';
import glob from 'glob';
import assert from 'assert';
import deepEqual from 'deep-equal';
import writeJsonFile from 'write-json-file';
import loadJsonFile from 'load-json-file';
import { TextmateEngine, TextmateScopeSelector, configurationData, TextmateScopeSelectorMap } from '../../src/textmateEngine';
import { WorkspaceDocumentProvider } from '../../src/workspaceSymbolProvider';
import jsonify from './jsonify';

const textmateEngineTestsPath = path.resolve(__dirname, '../data/textmateEngine');
const textmateScopeSelectorTests = loadJsonFile.sync(path.resolve(textmateEngineTestsPath, 'TextmateScopeSelector.json'));
const textmateScopeSelectorMapTests = loadJsonFile.sync(path.resolve(textmateEngineTestsPath, 'TextmateScopeSelectorMap.json'));

const engine = new TextmateEngine('matlab', 'source.matlab');
const workspaceDocumentProvider = new WorkspaceDocumentProvider('matlab');

suite('src/textmateEngine.ts', function() {
	this.timeout(60000);
	test('TextmateEngine class', async function() {
		const files = glob.sync(path.resolve(__dirname, '../../../../../../animals/*.m'));
		for (const file of files) {
			const resource = vscode.Uri.file(file);

			const document = await workspaceDocumentProvider.getDocument(resource);
			const tokens = jsonify(await engine.tokenize('source.matlab', document));

			const p = path
				.resolve(__dirname, '../data/textmateEngine', path.basename(file))
				.replace(/\.m$/, '.json');

			if (fs.existsSync(p)) {
				assert.strictEqual(deepEqual(loadJsonFile.sync(p), tokens), true);
			}
			writeJsonFile.sync(p, tokens, { indent: '  ' });
		}
	});
	test('TextmateScopeSelector class', function() {
		const testSuite = Object.values(textmateScopeSelectorTests);
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
		const testSuite = Object.values(textmateScopeSelectorMapTests);
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

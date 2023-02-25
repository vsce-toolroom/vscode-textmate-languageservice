'use strict';

import * as vscode from 'vscode';
import { strictEqual } from '../util/assert';

import { isWebRuntime, extensionContext, tokenServicePromise, documentServicePromise, definitionProviderPromise, TextmateScopeSelector } from '../util/factory';
import { BASE_CLASS_NAME, SAMPLE_FILE_BASENAMES, getSampleFileUri } from '../util/files';
import { pass } from '../util/bench';

import type { TextmateToken } from '../../src/services/tokenizer';

suite('test/suite/definition.test.ts - TextmateDefinitionProvider class (src/definition.ts)', async function() {
	this.timeout(10000);

	test('TextmateDefinitionProvider.provideDefinition(): Promise<[vscode.Location,...vscode.Location[]]>', async function() {
		// Early exit + pass if we are in web runtime.
		if (isWebRuntime) {
			this.skip();
		}

		vscode.window.showInformationMessage('TextmateDefinitionProvider class (src/definition.ts)');
		const results = await definitionProviderResult();

		for (let index = 0; index < results.length; index++) {
			const page = results[index];
			const filename = `${SAMPLE_FILE_BASENAMES[index]}.m`;

			for (const entry of page) {
				strictEqual(entry.definition instanceof Object, true, filename);
			}
		}
	});

	test('TextmateDefinitionProvider.provideDefinition(): Promise<vscode.Location[]>', async function() {
		// Early exit + pass if we are in web runtime.
		if (isWebRuntime) {
			this.skip();
		}

		const results = await definitionProviderResult();

		let error: TypeError | void;
		for (let index = 0; index < results.length; index++) {
			const page = results[index];
			const basename = SAMPLE_FILE_BASENAMES[index];

			try {
				await pass(extensionContext, 'definition', basename, page);
			} catch (e) {
				error = error || e as TypeError;
			}
		}
		if (error) {
			throw error;
		}
	});

	await vscode.commands.executeCommand('workbench.action.closeAllEditors');
});

async function definitionProviderResult() {
	const documentService = await documentServicePromise;
	const tokenizer = await tokenServicePromise;
	const definitionProvider = await definitionProviderPromise;

	const classReferenceSelector = new TextmateScopeSelector([
		'meta.inherited-class entity.name.type.class',
		'meta.method-call entity.name.type.class'
	]);

	function isBaseClassReference(token: TextmateToken) {
		return classReferenceSelector.match(token.scopes) && token.text === BASE_CLASS_NAME;
	}

	interface DefinitionTestResult extends TextmateToken {
		uri: vscode.Uri;
		definition: vscode.Location | void;
	}

	const samples = SAMPLE_FILE_BASENAMES.map(getSampleFileUri, extensionContext);
	const results: DefinitionTestResult[][] = [];

	for (let index = 0; index < samples.length; index++) {
		const resource = samples[index];

		const skinnyDocument = await documentService.getDocument(resource);
		const tokens = await tokenizer.fetch(skinnyDocument);

		const document = await vscode.workspace.openTextDocument(resource);
		const activeEditor = await vscode.window.showTextDocument(document);

		const symbols = tokens.filter(isBaseClassReference);

		const page: DefinitionTestResult[] = [];

		// Query each instance of the base class name (`Animal`) in the sample MATLAB file.
		for (const symbol of symbols) {
			const startPosition = new vscode.Position(symbol.line, symbol.startIndex);
			const endPosition = new vscode.Position(symbol.line, symbol.endIndex);

			activeEditor!.selection = new vscode.Selection(startPosition, endPosition);

			const locations = await definitionProvider.provideDefinition(document, startPosition);

			page.push({ ...symbol, uri: resource, definition: locations[0] });
		}
		results.push(page);
	}

	return results;
}

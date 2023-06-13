'use strict';

import * as vscode from 'vscode';

import { documentServicePromise, tokenServicePromise } from '../../util/factory';
import { BASENAMES, getSampleFileUri } from '../../util/files';
import { runSamplePass } from '../../util/bench';

import type { TextmateToken } from '../../../src/services/tokenizer';

suite('test/suite/tokenizer.test.ts - TokenizerService class (src/services/tokenizer.ts)', async function() {
	this.timeout(5000);

	test('TokenizerService.fetch(): Promise<TextmateToken[]>', async function() {
		vscode.window.showInformationMessage('TokenizerService class (src/services/tokenizer.ts)');
		const { samples, outputs } = await tokenServiceOutput();

		let error: TypeError | void = void 0;
		for (let index = 0; index < samples.length; index++) {
			const basename = BASENAMES[globalThis.languageId][index];
			const tokens = outputs[index];

			try {
				await runSamplePass('tokenizer', basename, tokens);
			} catch (e) {
				error = typeof error !== 'undefined' ? error : e as Error;
			}
		}
		if (error) {
			throw error;
		}
	});
});

async function tokenServiceOutput() {
	const documentService = await documentServicePromise;
	const tokenService = await tokenServicePromise;

	const samples = BASENAMES[globalThis.languageId].map(getSampleFileUri);
	const outputs: TextmateToken[][] = [];

	for (let index = 0; index < samples.length; index++) {
		const resource = samples[index];

		const document = await documentService.getDocument(resource);
		const tokens = await tokenService.fetch(document);

		outputs.push(tokens);
	}

	return { samples, outputs };
}

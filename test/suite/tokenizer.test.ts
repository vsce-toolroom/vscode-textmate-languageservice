'use strict';

import * as vscode from 'vscode';

import { matlabContext, matlabDocumentServicePromise, matlabTokenServicePromise } from '../util/factory';
import { SAMPLE_FILE_BASENAMES, getSampleFileUri } from '../util/files';
import { runSamplePass } from '../util/bench';

import type { TextmateToken } from '../../src/services/tokenizer';

suite('test/suite/tokenizer.test.ts - TokenizerService class (src/services/tokenizer.ts)', async function() {
	this.timeout(5000);

	test('TokenizerService.fetch(): Promise<TextmateToken[]>', async function() {
		vscode.window.showInformationMessage('TokenizerService class (src/services/tokenizer.ts)');
		const { samples, outputs } = await tokenServiceOutput();

		let error: TypeError | void = void 0;
		for (let index = 0; index < samples.length; index++) {
			const basename = SAMPLE_FILE_BASENAMES[index];
			const tokens = outputs[index];

			try {
				await runSamplePass(matlabContext, 'tokenizer', basename, tokens);
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
	const documentService = await matlabDocumentServicePromise;
	const tokenService = await matlabTokenServicePromise;

	const samples = SAMPLE_FILE_BASENAMES.map(getSampleFileUri, matlabContext);
	const outputs: TextmateToken[][] = [];

	for (let index = 0; index < samples.length; index++) {
		const resource = samples[index];

		const document = await documentService.getDocument(resource);
		const tokens = await tokenService.fetch(document);

		outputs.push(tokens);
	}

	return { samples, outputs };
}

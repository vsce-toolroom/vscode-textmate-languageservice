'use strict';

import * as vscode from 'vscode';

import { extensionContext, documentServicePromise, tokenServicePromise } from '../util/factory';
import { SAMPLE_FILE_BASENAMES, getSampleFileUri } from '../util/files';
import { runSamplePass } from '../util/bench';

import type { TextmateToken } from '../../src/services/tokenizer';

suite('test/suite/tokenizer.service.test.ts - TokenizerService class (src/services/tokenizer.ts)', async function() {
	this.timeout(5000);

	test('OutlineService.fetch(): Promise<TextmateToken[]>', async function() {
		vscode.window.showInformationMessage('TokenizerService class (src/services/tokenizer.ts)');
		const { samples, outputs } = await tokenServiceOutput();

		let error: TypeError | void;
		for (let index = 0; index < samples.length; index++) {
			const basename = SAMPLE_FILE_BASENAMES[index];
			const tokens = outputs[index];

			try {
				await runSamplePass(extensionContext, 'tokenizer', basename, tokens);
			} catch (e) {
				error = error || e as TypeError;
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

	const samples = SAMPLE_FILE_BASENAMES.map(getSampleFileUri, extensionContext);
	const outputs: TextmateToken[][] = [];

	for (let index = 0; index < samples.length; index++) {
		const resource = samples[index];

		const document = await documentService.getDocument(resource);
		const tokens = await tokenService.fetch(document);

		outputs.push(tokens);
	}

	return { samples, outputs };
}

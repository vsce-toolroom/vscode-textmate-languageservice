'use strict';

import * as vscode from 'vscode';

import { context, documentServicePromise, tokenServicePromise } from '../util/factory';
import { SAMPLE_FILE_BASENAMES, getSampleFileUri } from '../util/files';
import { sampler } from '../util/sampler';

import type { TextmateToken } from '../../src/services/tokenizer';

suite('src/services/tokenizer.ts', function() {
	test('TokenizerService class', async function() {
		this.timeout(5000);
		vscode.window.showInformationMessage('TokenizerService class (src/services/tokenizer.ts)');

		const documentService = await documentServicePromise;
		const tokenService = await tokenServicePromise;
		
		const samples = SAMPLE_FILE_BASENAMES.map(getSampleFileUri, context);
		const outputs: TextmateToken[][] = [];

		for (let index = 0; index < samples.length; index++) {
			const resource = samples[index];

			const document = await documentService.getDocument(resource);
			const tokens = await tokenService.fetch(document);

			outputs.push(tokens);
		}
		
		test('fetch(): Promise<TextmateToken[]>', async function() {
			for (let index = 0; index < samples.length; index++) {
				const basename = SAMPLE_FILE_BASENAMES[index];
				const tokens = outputs[index];
				await sampler.call(context, 'tokenizer', basename, tokens);
			}
		});
	});
});

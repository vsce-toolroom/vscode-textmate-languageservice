'use strict';

import * as vscode from 'vscode';

import { typescriptContext, typescriptDocumentServicePromise, typescriptTokenServicePromise } from '../util/factory';
import { SERVICE_SAMPLE_BASENAME, getSampleFileUri } from '../util/files';
import { runSamplePass } from '../util/bench';

import type { TextmateToken } from '../../src/services/tokenizer';

suite('test/suite/tokenizer-service.test.ts - TokenizerService service-only class (src/services/tokenizer.ts)', async function() {
	this.timeout(5000);

	test('TokenizerService.fetch(): Promise<TextmateToken[]>', async function() {
		vscode.window.showInformationMessage('TokenizerService service-only class (src/services/tokenizer.ts)');
		const { output } = await tokenServiceOutput();

		let error: TypeError | void = void 0;
		try {
			await runSamplePass(typescriptContext, 'tokenizer', SERVICE_SAMPLE_BASENAME, output);
		} catch (e) {
			error = typeof error !== 'undefined' ? error : e as Error;
		}
		if (error) {
			throw error;
		}
	});	
});

async function tokenServiceOutput() {
	const documentService = await typescriptDocumentServicePromise;
	const tokenService = await typescriptTokenServicePromise;

	const sample = getSampleFileUri.call(typescriptContext, SERVICE_SAMPLE_BASENAME);
	const document = await documentService.getDocument(sample);
	const output: TextmateToken[] = await tokenService.fetch(document);

	return { sample, output };
}

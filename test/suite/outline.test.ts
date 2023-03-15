'use strict';

import * as vscode from 'vscode';

import { matlabContext, matlabDocumentServicePromise, matlabOutlineServicePromise } from '../util/factory';
import { SAMPLE_FILE_BASENAMES, getSampleFileUri } from '../util/files';
import { runSamplePass } from '../util/bench';

import type { OutlineEntry } from '../../src/services/outline';

suite('test/suite/outline.test.ts - OutlineService class (src/services/outline.ts)', function() {
	this.timeout(5000);

	test('OutlineService.fetch(): Promise<OutlineEntry[]>', async function() {
		vscode.window.showInformationMessage('OutlineService class (src/services/outline.ts)');
		const { outputs, samples } = await outlineServiceOutput();

		let error: TypeError | void = void 0;
		for (let index = 0; index < samples.length; index++) {
			const basename = SAMPLE_FILE_BASENAMES[index];
			const outline = outputs[index];

			try {
				await runSamplePass(matlabContext, 'outline', basename, outline);
			} catch (e) {
				error = typeof error !== 'undefined' ? error : e as Error;
			}
		}
		if (error) {
			throw error;
		}
	});
});

async function outlineServiceOutput() {
	const documentService = await matlabDocumentServicePromise;
	const outlineService = await matlabOutlineServicePromise;

	const samples = SAMPLE_FILE_BASENAMES.map(getSampleFileUri, matlabContext);
	const outputs: OutlineEntry[][] = [];

	for (let index = 0; index < samples.length; index++) {
		const resource = samples[index];

		const document = await documentService.getDocument(resource);
		const outline = await outlineService.fetch(document);

		outputs.push(outline);
	}

	return { samples, outputs };
}

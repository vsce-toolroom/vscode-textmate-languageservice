'use strict';

import * as vscode from 'vscode';

import { documentServicePromise, outlineServicePromise } from '../../util/factory';
import { BASENAMES, getSampleFileUri } from '../../util/files';
import { runSamplePass } from '../../util/bench';

import type { OutlineEntry } from '../../../src/services/outline';

suite('test/suite/outline.test.ts - OutlineService class (src/services/outline.ts)', function() {
	this.timeout(5000);

	test('OutlineService.fetch(): Promise<OutlineEntry[]>', async function() {
		void vscode.window.showInformationMessage('OutlineService class (src/services/outline.ts)');
		const { outputs, samples } = await outlineServiceOutput();

		let error: TypeError | void = void 0;
		for (let index = 0; index < samples.length; index++) {
			const basename = BASENAMES[globalThis.languageId][index];
			const outline = outputs[index];

			try {
				await runSamplePass('outline', basename, outline);
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
	const documentService = await documentServicePromise;
	const outlineService = await outlineServicePromise;

	const samples = BASENAMES[globalThis.languageId].map(getSampleFileUri);
	const outputs: OutlineEntry[][] = [];

	for (const resource of samples) {
		const document = await documentService.getDocument(resource);
		const outline = await outlineService.fetch(document);

		outputs.push(outline);
	}

	return { outputs, samples };
}

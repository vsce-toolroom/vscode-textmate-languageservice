'use strict';

import * as vscode from 'vscode';

import { extensionContext, documentServicePromise, outlineServicePromise } from '../util/factory';
import { SAMPLE_FILE_BASENAMES, getSampleFileUri } from '../util/files';
import { pass } from '../util/bench';

import type { OutlineEntry } from 'src/services/outline';

suite('test/suite/outline.service.test.ts - OutlineService class (src/services/outline.ts)', function() {
	this.timeout(5000);

	test('OutlineService.fetch(): Promise<OutlineEntry[]>', async function() {
		vscode.window.showInformationMessage('OutlineService class (src/services/outline.ts)');
		const { outputs, samples } = await outlineServiceOutput();

		let error: TypeError | void;
		for (let index = 0; index < samples.length; index++) {
			const basename = SAMPLE_FILE_BASENAMES[index];
			const outline = outputs[index];

			try {
				await pass(extensionContext, 'outline', basename, outline);
			} catch (e) {
				error = error || e as TypeError;
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

	const samples = SAMPLE_FILE_BASENAMES.map(getSampleFileUri, extensionContext);
	const outputs: OutlineEntry[][] = [];

	for (let index = 0; index < samples.length; index++) {
		const resource = samples[index];

		const document = await documentService.getDocument(resource);
		const outline = await outlineService.fetch(document);

		outputs.push(outline);
	}

	return { samples, outputs };
}

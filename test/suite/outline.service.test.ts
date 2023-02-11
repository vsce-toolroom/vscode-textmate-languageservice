'use strict';

import * as vscode from 'vscode';

import { context, documentServicePromise, outlineServicePromise } from '../util/factory';
import { SAMPLE_FILE_BASENAMES, getSampleFileUri } from '../util/files';
import { sampler } from '../util/sampler';

import type { OutlineEntry } from 'src/services/outline';

suite('src/services/outline.ts', function() {
	test('OutlineService class', async function() {
		this.timeout(5000);
		vscode.window.showInformationMessage('OutlineService class (src/services/outline.ts)');

		const documentService = await documentServicePromise;
		const outlineService = await outlineServicePromise;

		const samples = SAMPLE_FILE_BASENAMES.map(getSampleFileUri, context);
		const outputs: OutlineEntry[][] = [];

		for (let index = 0; index < samples.length; index++) {
			const resource = samples[index];

			const document = await documentService.getDocument(resource);
			const outline = await outlineService.fetch(document);

			outputs.push(outline);
		}

		test('fetch(): Promise<OutlineEntry[]>', async function() {
			for (let index = 0; index < samples.length; index++) {
				const basename = SAMPLE_FILE_BASENAMES[index];
				const outline = outputs[index];
				await sampler.call(context, 'outline', basename, outline);
			}
		});
	});
});

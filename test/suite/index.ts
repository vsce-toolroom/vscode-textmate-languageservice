'use strict';

import * as vscode from 'vscode';
import Mocha = require('mocha');

import { TEST_COMPONENT_BASENAMES, getComponentFileFsPath } from '../util/files';

export async function run(): Promise<void> {
	// Create the mocha test
	const mocha = new Mocha({
		ui: 'tdd',
		color: true,
		timeout: 30000
	});

	const files = TEST_COMPONENT_BASENAMES.map(getComponentFileFsPath);
	files.forEach(f => { mocha.addFile(f); });

	return new Promise(function(c, e) {
		try {
			vscode.window.showInformationMessage('Start all tests.');
			mocha.run(failures => {
				if (failures > 0)
					throw new Error(`${failures} tests failed.`);
				else
					c();
			});
		} catch (err) {
			console.error(err);
			e(err);
		}
	});
}

'use strict';

import * as path from 'path';
import * as vscode from 'vscode';
import Mocha = require('mocha');
import glob = require('glob');

export async function run(): Promise<void> {
	// Create the mocha test
	const mocha = new Mocha({
		ui: 'tdd',
		color: true,
		timeout: 30000
	});

	return new Promise(async function(c, e) {
		const files = glob.sync('**/*.test.js', { cwd: __dirname }).sort(forwardSortServicized);
		files.forEach(f => { mocha.addFile(path.resolve(__dirname, f)) });
		try {
			vscode.window.showInformationMessage('Start all tests.');
			mocha.run(failures => {
				if (failures > 0)
					e(new Error(`${failures} tests failed.`));
				else
					c();
			});
		} catch (err) {
			console.error(err);
			e(err);
		}
	});

	function forwardSortServicized(filepath: string) {
		return /[\//]services[\//][^\//]+$/.test(filepath) ? -1 : 1;
	}
}

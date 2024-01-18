'use strict';

import * as path from 'path';
import { runTests as runTestsInElectron } from '@vscode/test-electron';

async function main() {
	try {
		const extensionDevelopmentPath = path.resolve(__dirname, '../../../..');
		const extensionTestsPath = path.resolve(__dirname, './runner-electron.js');
		const launchArgs = [
			'--disable-extensions=1',
			'--disable-gpu',
			'--disable-workspace-trust',
			'--no-xshm',
			extensionDevelopmentPath
		];
		// Node environment.
		await runTestsInElectron({
			extensionDevelopmentPath,
			extensionTestsPath,
			launchArgs
		});
	} catch (_) {
		// eslint-disable-next-line no-console
		console.error('Failed to run tests');
		process.exit(1);
	}
}

void main();

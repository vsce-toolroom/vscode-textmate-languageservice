'use strict';

import * as path from 'path';
import { runTests as runTestsInElectron } from '@vscode/test-electron';

async function main() {
	try {
		const extensionDevelopmentPath = path.resolve(__dirname, '../../../..');
		const extensionTestsPath = path.resolve(__dirname, './runner-electron.test.js');
		const launchArgs = [
			'--disable-gpu',
			'--disable-workspace-trust',
			'--no-xshm',
			extensionDevelopmentPath
		];
		// Node environment.
		await runTestsInElectron({
			extensionTestsPath,
			extensionDevelopmentPath,
			launchArgs
		});
	} catch (_) {
		console.error('Failed to run tests');
		process.exit(1);
	}
}

main();

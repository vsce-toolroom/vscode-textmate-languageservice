'use strict';

import * as path from 'path';
import { runTests as runElectronTests } from '@vscode/test-electron';
// import { BrowserType, open, runTests as runBrowserTests } from '@vscode/test-web';

async function main() {
	try {
		const extensionDevelopmentPath = path.resolve(__dirname, '../../../..');
		const extensionTestsPath = path.resolve(__dirname, './suite/index');
		// Node environment.
		await runElectronTests({
			extensionDevelopmentPath,
			extensionTestsPath,
			launchArgs: [
				'--disable-extensions',
				'--disable-gpu',
				'--disable-workspace-trust',
				'--no-xshm',
				extensionDevelopmentPath
			]
		});
		// Web environment.
		/**
		const options = {
			browserType: 'chromium' as BrowserType,
			extensionDevelopmentPath
		};
		await open(options);
		await runBrowserTests({ ...options, extensionTestsPath });
		 */
	} catch (err) {
		console.error('Failed to run tests');
		process.exit(1);
	}
}

main();

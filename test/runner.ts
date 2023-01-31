'use strict';

import * as path from 'path';
import { runTests as runTestsInElectron } from '@vscode/test-electron';
import { BrowserType, open, runTests as runTestsInBrowser } from '@vscode/test-web';

async function main() {
	try {
		const extensionDevelopmentPath = path.resolve(__dirname, '../../../..');
		const extensionTestsPath = path.resolve(__dirname, './suite/index');
		const browserType: BrowserType = 'chromium';
		const port = 8080;
		const devTools = false;
		const headless = true;
		// Node environment.
		await runTestsInElectron({
			extensionTestsPath,
			extensionDevelopmentPath,
			launchArgs: [
				'--disable-extensions',
				'--disable-gpu',
				'--disable-workspace-trust',
				'--no-xshm',
				extensionDevelopmentPath
			]
		});
		// Web environment.
		await runTestsInBrowser({
			extensionTestsPath,
			extensionDevelopmentPath,
			browserType,
			port,
			devTools,
			headless
		});
	} catch (err) {
		console.error('Failed to run tests');
		process.exit(1);
	}
}

main();

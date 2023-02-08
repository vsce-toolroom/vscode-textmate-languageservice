'use strict';

import type { BrowserType } from '@vscode/test-web';
import { runTests as runTestsInBrowser } from '@vscode/test-web';

const pathSep = __dirname.match(/\/|\\/)![0];

async function main() {
	try {
		const relativeExtensionPath = `../../..`;
		const extensionDevelopmentPath = __dirname
			.split(pathSep)
			.slice(-1 * relativeExtensionPath.split('/').length)
			.join(pathSep);
		const extensionTestsPath = extensionDevelopmentPath + '/node_modules/vscode-textmate-languageservice/dist/suite.test';
		const browserType: BrowserType = 'chromium';
		const port = 8080;
		const devTools = false;
		const headless = true;
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

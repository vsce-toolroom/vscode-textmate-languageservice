'use strict';

import * as path from 'path';
import { runTests as runTestsInBrowser } from '@vscode/test-web';

import type { BrowserType } from '@vscode/test-web';

async function main() {
	try {
		const extensionDevelopmentPath = path.resolve(__dirname, path.normalize('../../../..'));
		const folderPath = extensionDevelopmentPath; // we don't have argv[1] path in web runner
		const extensionTestsPath = path.resolve(__dirname, path.normalize('./runner-web.test.js'));
		const browserType: BrowserType = 'chromium';
		const port = 8080;
		const headless = true;
		const devTools = true;
		// Web environment.
		await runTestsInBrowser({
				extensionTestsPath,
				extensionDevelopmentPath,
				folderPath,
				browserType, port, headless, devTools
		});
	} catch (e) {
		console.error('Failed to run tests');
		throw e;
	}
}

main();

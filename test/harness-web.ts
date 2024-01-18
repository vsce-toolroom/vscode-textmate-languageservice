'use strict';

import * as path from 'path';
import { runTests as runTestsInBrowser } from '@vscode/test-web';

import type { BrowserType } from '@vscode/test-web';

async function main() {
	try {
		const extensionDevelopmentPath = path.resolve(__dirname, '../../../..');
		const extensionTestsPath = path.resolve(__dirname, './runner-web.js');
		const extensionPaths = [];
		const browserType: BrowserType = 'chromium';
		const port = 8080;
		const headless = true;
		const devTools = false;
		// Web environment.
		await runTestsInBrowser({
			browserType,
			devTools,
			extensionDevelopmentPath,
			extensionPaths,
			extensionTestsPath,
			headless,
			port
		});
	} catch (e) {
		// eslint-disable-next-line no-console
		console.error('Failed to run tests');
		throw e;
	}
}

void main();

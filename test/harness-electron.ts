'use strict';

import * as path from 'path';
import { runTests as runTestsInElectron } from '@vscode/test-electron';

const extensions = ['vscode-matlab', 'vscode-typescript'];
const extensionsPath = path.resolve(__dirname, '../../../../..');

async function main() {
	try {
		for (let index = 0; index < extensions.length; index++) {
			const extensionName = extensions[index];
			const language = extensionName.split('-')[1];
			const extensionDevelopmentPath = path.join(extensionsPath, extensionName);
			const extensionTestsPath = path.resolve(__dirname, `./runner-electron.${language}.js`);
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
		}
	} catch (_) {
		console.error('Failed to run tests');
		process.exit(1);
	}
}

main();

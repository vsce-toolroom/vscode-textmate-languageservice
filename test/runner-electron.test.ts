'use strict';

import { runTests as runTestsInElectron } from '@vscode/test-electron';

const pathSep = __dirname.match(/\/|\\/)![0];

async function main() {
	try {
		const relativeExtensionPath = `../../..`;
		const extensionDevelopmentPath = __dirname
			.split(pathSep)
			.slice(-1 * relativeExtensionPath.split('/').length)
			.join(pathSep);
		const extensionTestsPath = extensionDevelopmentPath + '/node_modules/vscode-textmate-languageservice/dist/suite.test';
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
	} catch (err) {
		console.error('Failed to run tests');
		process.exit(1);
	}
}

main();

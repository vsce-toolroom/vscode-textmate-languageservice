'use strict';

const shelljs = require('shelljs');
const path = require('path');
const glob = require('glob');

const extensionPath = process.argv[2];
const extensionTestDevDependencies = [
	'mocha',
	'@vscode/test-electron',
	'@vscode/test-web'
];
const extensionTestDataFolders = ['data', 'samples'];

shelljs.exec('npm pack');
const tarballPath = path.basename(glob.globSync('*.tgz')[0]);
shelljs.exec(`npm install --prefix ${extensionPath} --omit=dev ${tarballPath}`);

const packageJSON = require('../package.json');

for (let index = 0; index < extensionTestDevDependencies.length; index++) {
	/** @type {keyof typeof packageJSON.devDependencies} */
	const packageName = extensionTestDevDependencies[index];
	const packageVersion = packageJSON.devDependencies[packageName];
	const testDependency = `${packageName}@${packageVersion}`;
	shelljs.exec(`npm install --prefix ${extensionPath} --save-dev --package-lock false ${testDependency}`);
}

for (let index = 0; index < extensionTestDataFolders.length; index++) {
	const dataDir = extensionTestDataFolders[index];
	shelljs.mkdir(`${extensionPath}/${dataDir}`);
	shelljs.cp('-r', `./test/${dataDir}/*`, `${extensionPath}/${dataDir}`);		
}

shelljs.exec(`npm exec --prefix ${extensionPath} playwright install`);

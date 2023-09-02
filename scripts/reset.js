'use strict';

const shelljs = require('shelljs');
const path = require('path');

const extensionPath = process.argv[2];
const extensionTestDataFolders = ['data', 'samples'];

const root = path.relative(__dirname, '..');

shelljs.cd(extensionPath);
shelljs.exec('npm un vscode-textmate-languageservice');
shelljs.cd(root);

shelljs.rm('-rf', ...extensionTestDataFolders.map(f => `${extensionPath}/${f}`));
shelljs.rm('-rf', "*.tgz", `${extensionPath}/*.tgz`);

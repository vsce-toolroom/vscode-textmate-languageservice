'use strict';

const shelljs = require('shelljs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const extensionPath = path.resolve(root, process.argv[2]);
const extensionTestDataFolders = ['data', 'samples'];

shelljs.cd(extensionPath);
shelljs.exec('npm install vscode-textmate-languageservice@latest');
shelljs.cd(root);

shelljs.rm('-rf', ...extensionTestDataFolders.map(f => `${extensionPath}/${f}`));
shelljs.rm('-rf', "*.tgz", `${extensionPath}/*.tgz`);

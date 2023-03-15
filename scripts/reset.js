'use strict';

const shelljs = require('shelljs');

const extensionPath = process.argv[2];
const extensionTestDataFolders = ['data', 'samples'];

shelljs.rm("-rf", ...extensionTestDataFolders.map(f => `${extensionPath}/${f}`));
shelljs.rm("-rf", "*.tgz", `${extensionPath}/*.tgz`);

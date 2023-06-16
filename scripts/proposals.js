'use strict';

const shelljs = require('shelljs');
const path = require('path');
const process = require('process');
const fs = require('fs');
const prettier = require('prettier');

const enabledApiProposals = require('../package.json').enabledApiProposals;

const root = path.relative(__dirname, '..');

shelljs.exec('npx @vscode/dts dev');

for (const proposal of enabledApiProposals) {	
	let definitionSrc = fs.readFileSync(path.resolve(root, `./src/vscode.proposed.${proposal}.d.ts`))
	const prettierrcJson = require('../.prettierrc.json');
	definitionSrc = prettier.format(definitionSrc, prettierrcJson);
	fs.writeFileSync(path.resolve(root, `./src/vscode.proposed.${proposal}.d.ts`), definitionSrc);
	fs.unlinkSync(path.resolve(root, `./vscode.proposed.${proposal}.d.ts`));
}

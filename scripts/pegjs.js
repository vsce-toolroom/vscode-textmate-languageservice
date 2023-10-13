'use strict';

// @ts-check
const peggy = require('peggy');
const prettierEslint = require('prettier-eslint');
const fs = require('fs');
const shelljs = require('shelljs');

const filePath = './src/scopes/parser.ts';
let parserText = fs.readFileSync('./src/scopes/parser.pegjs', 'utf8');

const pegconfig = {
	'plugins': [require('ts-pegjs')],
	output: 'source',
	cache: false,
    format: 'commonjs',
};

const pegconfigJson = require('../src/scopes/pegconfig.json');
Object.assign(pegconfig, pegconfigJson);
pegconfig.skipTypeComputation = true;
pegconfig.customHeader = '';
pegconfig.tspegjs = {};
pegconfig.tspegjs.customHeader = fs.readFileSync('./src/scopes/header.ts');

parserText = peggy.generate(parserText, pegconfig);

parserText = parserText.replace(/\/\/ @ts-ignore\n/g, '');
parserText = parserText.replace(/^import \b/m, 'import * as ');
parserText = parserText.replace(/^type \b/gm, 'export type ');

parserText = parserText.replace(/(?<=function peg\$computeLocation\([^\)]+)\)/,  '?)');
parserText = parserText.replace(/(?<=function peg\$SyntaxError\([^)]+\))/,  ': void');

parserText = parserText.replace('// Generated by Peggy 3.0.2.', '');
parserText = parserText.replace(/\/\/$/m, '');
parserText = parserText.replace('// https://peggyjs.org/', '');
parserText = parserText.replace('/* eslint-disable */', '')

parserText = prettierEslint({
	eslintConfig: require('../.eslintrc.json'),
	text: parserText,
	logLevel: 'warn',
	prettierOptions: require('../.prettierrc.json')
});

fs.writeFileSync(filePath, parserText);

// For some reason, Prettier-ESLint isn't `--fix`ing keywords & whitespace.
// Let's brute-force another ESLint run just to get it fixed.
shelljs.exec('npx eslint ./src/scopes/parser.ts --fix');

// Disable ESLint yet again because the file still has ~30 lint errors.
parserText = fs.readFileSync('./src/scopes/parser.ts', 'utf8');
parserText = '/* eslint-disable */\n' + parserText;
fs.writeFileSync(filePath, parserText);

'use strict';

const peggy = require('peggy');
const prettier = require('prettier');
const fs = require('fs');

let parserText = fs.readFileSync('./src/scopes/parser.pegjs', 'utf8');

const pegconfig = {
	'plugins': [require('ts-pegjs')],
	dependencies: { 'matchers': './matchers' },
	output: 'source',
	cache: false,
    format: 'commonjs'
};
Object.assign(pegconfig, require('../src/scopes/pegconfig.json'));
parserText = peggy.generate(parserText, pegconfig);

const prettierrcJson = require('../.prettierrc.json');
parserText = prettier.format(parserText, prettierrcJson);

fs.writeFileSync('./src/scopes/parser.ts', parserText);

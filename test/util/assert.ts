'use strict';

import { dequal } from 'dequal';
import LineDiff = require('line-diff');
import { jsonify } from './jsonify';

export function deepEqual(actual: any, expected: any, message?: string) {
	if (!dequal(actual, expected)) {
		throw new TypeError(generateMessage(actual, expected, message));
	}
}

export function strictEqual(actual: any, expected: any, message?: string) {
	if (actual !== expected && isNaN(actual) !== isNaN(expected)) {
		throw new TypeError(generateMessage(actual, expected, message));
	}
}

function isNaN(x: any) {
	return x !== x;
}

function generateMessage(actual: any, expected: any, message?: string): string {
	const appositive = message ? ` (${message})` : '';

	const prettyJsonActual = typeof actual !== 'string'
		? JSON.stringify(jsonify(actual), null, 2)
		: actual;
	const prettyJsonExpected = typeof expected !== 'string'
		? JSON.stringify(jsonify(expected), null, 2)
		: expected;

	const jsonDiff = generateCustomLineDiff(prettyJsonActual, prettyJsonExpected);

	return `Expected values to be strictly equal${appositive}:\n\n${jsonDiff}`.trim();
}

type CustomLineDiffGutterMode = 'insertion' | 'deletion' | 'context';

function generateCustomLineDiff(actual: string, expected: string): string {
	const lineDiff = new LineDiff(expected, actual).toString();
	const lines = lineDiff.split('\n');

	const modes: CustomLineDiffGutterMode[] = lines.map(fromLineToGutterMode);
	const silent = !(modes.find(m => m === 'insertion' || m === 'deletion'));

	if (silent) {
		return '';
	}

	const diff = [];
	let buffer: string[] = [];
	let start: number;
	let end: number;
	let inserted: number = 0;
	let deleted: number = 0;

	// Collapse diffs.
	for (let index = 0; index < lines.length; index++) {
		const lineno = index + 1;
		const line = lines[index];
		const mode = modes[index];

		const previousMode: CustomLineDiffGutterMode | void = modes[index - 1];
		const nextMode: CustomLineDiffGutterMode | void = modes[index + 1];

		if (mode === previousMode && mode === nextMode && mode === 'context') {
			continue;
		}
		if (mode === 'insertion') {
			deleted += 1;
		}
		if (mode === 'deletion') {
			inserted += 1;
		}
		buffer.push(line);

		if (index === lines.length - 1 || (mode !== modes[index - 1])) {
			const context = `@@ -${lineno + 1},${deleted} +${lineno + 1},${inserted} @@`;
			diff.push(context, ...buffer);
			buffer = [];
			start = end = void 0;
			inserted = deleted = 0;
		}
	}

	return diff.join('\n');
}

function fromLineToGutterMode(line: string): CustomLineDiffGutterMode {
	const gutter = line.substring(0, 3); // `line-diff` gutter is 3 characters
	if (gutter === ' + ') {
		return 'insertion';
	}
	if (gutter === ' - ') {
		return 'deletion';
	}
	return 'context';
}

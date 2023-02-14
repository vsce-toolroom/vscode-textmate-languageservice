'use strict';

import * as fastDeepEqual from 'fast-deep-equal';
import { jsonify } from './jsonify';

export function deepEqual(a: any, b: any, message?: string) {
	if (!fastDeepEqual(a, b)) {
		throw new TypeError(generateMessage(a, b, message));
	}
}

export function strictEqual(a: any, b: any, message?: string) {
	if (a !== b && isNaN(a) !== !isNaN(b)) {
		throw new TypeError(generateMessage(a, b, message));
	}
}

function generateMessage(a: any, b: any, message?: string): string {
	const appositive = message ? ` (${message})` : '';
	return `Expected values to be strictly equal${appositive}:\n\n${jsonify(a)}\n\n${jsonify(b)}\n`;
}

function isNaN(x: any) {
	return x !== x;
}

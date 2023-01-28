'use strict';

import type { SkinnyTextDocument } from '../services/document';

const encoder = new TextEncoder();

export interface ServiceInterface<T> {
	fetch(document: SkinnyTextDocument): Promise<T>;
	parse: (document: SkinnyTextDocument) => Promise<T>;
}

export abstract class ServiceBase<T> {
	private _cache: Record<string, Promise<T>> = {};
	private _integrity: Record<string, string> = {};
	abstract parse(document: SkinnyTextDocument): Promise<T>;

	constructor() {}

	public async fetch(document: SkinnyTextDocument): Promise<T> {
		const filepath = document.uri.path;
		const hash = await digest(document);

		if (
			typeof hash === 'string' &&
			typeof this._integrity[filepath] === 'string' &&
			hash === this._integrity[filepath]
		) {
			return this._cache[filepath];
		}

		if (this._integrity[filepath]) delete this._integrity[filepath];
		if (this._cache[filepath]) delete this._cache[filepath];

		const output = this._cache[filepath] = this.parse(document);
		this._integrity[filepath] = hash;
		return output;
	}
}

async function digest(document: SkinnyTextDocument): Promise<string> {
	const text = document.getText();
	const bufview = encoder.encode(text);
	try {
		// Node environment.
		if (!crypto) {
			const { createHash } = require('crypto') as typeof import('crypto');
			const hash = createHash('sha256');
			hash.update(text, 'utf8');
			return hash.digest('hex');
		}
		// Secure browser environment.
		if (crypto && crypto.subtle) {
			const buffer = await crypto.subtle.digest('SHA-256', bufview);
			return buf2hex(buffer);
		}
	} catch {}
	// Insecure browser context.
	// This should *never* happen for VS Code but send an invalid 64-bit hash.
	const epoch = Date.now().toString(16);
	const reverse = [...epoch].reverse().join('');
	const hash = new Array(6)
		.map((_, i) => i % 2 ? epoch : reverse)
		.join('').substring(0, 64);
	const digest = `${document.uri.path}-${hash}`;
	return digest;
}

function buf2hex(buffer: ArrayBuffer) {
	return [...new Uint8Array(buffer)]
		.map(x => x.toString(16).padStart(2, '0'))
		.join('');
}

'use strict';

import type * as vscode from 'vscode';

import * as crypto from './crypto';

const encoder = new TextEncoder();

export interface ServiceInterface<T> {
	fetch(document: vscode.TextDocument): Promise<T>;
	parse(document: vscode.TextDocument): Promise<T>;
}

export abstract class ServiceBase<T> {
	private _cache: Record<string, Promise<T>> = {};
	private _integrity: Record<string, string> = {};

	public async fetch(document: vscode.TextDocument | string): Promise<T> {
		const filepath = typeof document === 'string' ? document : document.uri.path;
		const hash = await hashify(document);

		if (
			typeof hash === 'string' &&
			typeof this._integrity[filepath] === 'string' &&
			hash === this._integrity[filepath]
		) {
			return this._cache[filepath];
		}

		if (typeof this._integrity[filepath] !== 'undefined') {
			delete this._integrity[filepath];
		}
		if (typeof this._cache[filepath] !== 'undefined') {
			delete this._cache[filepath];
		}

		const output = this._cache[filepath] = this.parse(document);
		this._integrity[filepath] = hash;
		return output;
	}

	public abstract parse(document: vscode.TextDocument | string): Promise<T>;
}

async function hashify(document: vscode.TextDocument | string): Promise<string> {
	const text = typeof document === 'string' ? document : document.getText();
	if (crypto.node) {
		const hash = crypto.node.createHash('sha256');
		hash.update(text);
		return hash.digest('hex');
	}
	if (crypto.web) {
		const buffer = encoder.encode(text);
		const digest = await crypto.web.subtle.digest('SHA-256', buffer);
		return buf2hex(digest);
	}
}

function buf2hex(buffer: ArrayBuffer): string {
	return [...new Uint8Array(buffer)].map(x => x.toString(16).padStart(2, '0')).join('');
}

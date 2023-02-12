'use strict';

import * as vscode from 'vscode';
import * as crypto from './crypto';

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
	if (vscode.env.appHost === 'desktop') {
		const hash = crypto.node.createHash('sha256');
		hash.update(text);
		return hash.digest('hex');
	} else {
		const buffer = encoder.encode(text);
		const digest = await crypto.web.subtle.digest('SHA-256', buffer);
		return buf2hex(digest);
	}
}

function buf2hex(buffer: ArrayBuffer): string {
	return [...new Uint8Array(buffer)].map(x => x.toString(16).padStart(2, '0')).join('');
}

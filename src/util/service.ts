import type { SkinnyTextDocument } from '../services/document';

export interface ServiceInterface<T> {
	fetch(document: SkinnyTextDocument): Promise<T>;
	parse: (document: SkinnyTextDocument) => Promise<T>;
}

export default abstract class ServiceBase<T> {
	private _cache: Record<string, Promise<T>> = {};
	private _integrity: Record<string, string> = {};
	abstract parse(document: SkinnyTextDocument): Promise<T>;

	constructor() {
		this._cache = {};
		this._integrity = {};
	}

	public async fetch(document: SkinnyTextDocument): Promise<T> {
		const filepath = document.uri.path;
		const text = document.getText();
		const hash = sha1(text);

		if (
			typeof hash === 'string' &&
			typeof this._integrity[filepath] === 'string' &&
			hash === this._integrity[filepath]
		) {
			return this._cache[filepath];
		}

		if (this._integrity[filepath]) delete this._integrity[filepath];
		if (this._cache[filepath]) delete this._cache[filepath];

		return (this._cache[filepath] = this.parse(document));
	}
}

type hash = string;

function sha1(text: string): hash {
	return require('git-sha1')(text) as hash;
}

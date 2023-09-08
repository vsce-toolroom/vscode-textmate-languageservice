'use strict';

import * as vscode from 'vscode';
import { readFileText } from '../util/loader';
import { Disposable } from '../util/dispose';

import type { ConfigData } from '../config';
import { ResolverService } from './resolver';
import { getOniguruma } from '../util/oniguruma';

const onigLibPromise = getOniguruma();
const resolver = new ResolverService(onigLibPromise);

export interface LiteTextLine {
	text: string;
}

export interface LiteTextDocument {
	readonly uri: vscode.Uri;
	readonly version: number;
	readonly lineCount: number;
	readonly languageId: string;

	lineAt(line: number): LiteTextLine;
	getText(): string;
}

export interface DocumentServiceInterface {
	readonly onDidChangeDocument: vscode.Event<LiteTextDocument>;
	readonly onDidCreateDocument: vscode.Event<LiteTextDocument>;
	readonly onDidDeleteDocument: vscode.Event<vscode.Uri>;

	getAllDocuments(): Thenable<Iterable<LiteTextDocument>>;
	getDocument(resource: vscode.Uri): Thenable<LiteTextDocument | undefined>;
}

export class DocumentService extends Disposable implements DocumentServiceInterface {
	private readonly _onDidChangeDocumentEmitter = this._register(new vscode.EventEmitter<LiteTextDocument>());
	private readonly _onDidCreateDocumentEmitter = this._register(new vscode.EventEmitter<LiteTextDocument>());
	private readonly _onDidDeleteDocumentEmitter = this._register(new vscode.EventEmitter<vscode.Uri>());

	private _watcher: vscode.FileSystemWatcher | undefined;

	constructor(private _languageId: string, private _config: ConfigData) {
		super();
	}

	public get onDidChangeDocument() {
		this.ensureWatcher();
		return this._onDidChangeDocumentEmitter.event;
	}

	public get onDidCreateDocument() {
		this.ensureWatcher();
		return this._onDidCreateDocumentEmitter.event;
	}

	public get onDidDeleteDocument() {
		this.ensureWatcher();
		return this._onDidDeleteDocumentEmitter.event;
	}

	public async getAllDocuments() {
		const resources = await vscode.workspace.findFiles(this._config.include, this._config.exclude);
		const docs = await Promise.all(resources.map(doc => this.getDocument(doc)));
		return docs.filter((doc): doc is LiteTextDocument => !!doc);
	}

	public async getDocument(resource: vscode.Uri): Promise<LiteTextDocument> {
		const matchingDocuments = vscode.workspace.textDocuments.filter(function(document) {
			return document.uri.toString(true) === resource.toString(true);
		});
		if (matchingDocuments.length !== 0) {
			return matchingDocuments[0];
		}

		const text = await readFileText(resource);

		const lines: LiteTextLine[] = [];
		const parts = text.split(/(\r?\n)/);
		const lineCount = Math.floor(parts.length / 2) + 1;
		for (let line = 0; line < lineCount; line++) {
			lines.push({
				text: parts[line * 2]
			});
		}

		const filename = resource.path.split('/').pop();
		const point = resolver.getLanguageDefinitionFromFilename(filename);
		const languageId = point?.id;

		return {
			getText() {
				return text;
			},
			languageId,
			lineAt(index) {
				return lines[index];
			},
			lineCount,
			uri: resource,
			version: 0
		};
	}

	private ensureWatcher(): void {
		if (this._watcher) {
			return void 0;
		}

		this._watcher = this._register(vscode.workspace.createFileSystemWatcher(this._config.include));

		this._watcher.onDidChange(async function(this: DocumentService, resource: vscode.Uri) {
			const document = await this.getDocument(resource);
			if (document) {
				this._onDidChangeDocumentEmitter.fire(document);
			}
		}, this, this._disposables);

		this._watcher.onDidCreate(async function(this: DocumentService, resource: vscode.Uri) {
			const document = await this.getDocument(resource);
			if (document) {
				this._onDidCreateDocumentEmitter.fire(document);
			}
		}, this, this._disposables);

		this._watcher.onDidDelete(function(this: DocumentService, resource: vscode.Uri) {
			this._onDidDeleteDocumentEmitter.fire(resource);
		}, this, this._disposables);

		vscode.workspace.onDidChangeTextDocument(function(this: DocumentService, e: vscode.TextDocumentChangeEvent) {
			if (e.document.languageId === this._languageId) {
				this._onDidChangeDocumentEmitter.fire(e.document);
			}
		}, this, this._disposables);
	}
}

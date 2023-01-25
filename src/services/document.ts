'use strict';

import * as vscode from 'vscode';
import { readFileText } from '../util/loader';
import type { ConfigData } from '../config/config';
import { Disposable } from '../util/dispose';

export interface SkinnyTextLine {
	text: string;
}

export interface SkinnyTextDocument {
	readonly uri: vscode.Uri;
	readonly version: number;
	readonly lineCount: number;

	lineAt(line: number): SkinnyTextLine;
	getText(): string;
}

export interface WorkspaceDocumentServiceInterface {
	getAllDocuments(): Thenable<Iterable<SkinnyTextDocument>>;
	getDocument(resource: vscode.Uri): Thenable<SkinnyTextDocument | undefined>;

	readonly onDidChangeDocument: vscode.Event<SkinnyTextDocument>;
	readonly onDidCreateDocument: vscode.Event<SkinnyTextDocument>;
	readonly onDidDeleteDocument: vscode.Event<vscode.Uri>;
}

export class WorkspaceDocumentService extends Disposable implements WorkspaceDocumentServiceInterface {	
	constructor(private _languageId: string, private _config: ConfigData) {
		super();
	}

	private readonly _onDidChangeDocumentEmitter = this._register(new vscode.EventEmitter<SkinnyTextDocument>());
	private readonly _onDidCreateDocumentEmitter = this._register(new vscode.EventEmitter<SkinnyTextDocument>());
	private readonly _onDidDeleteDocumentEmitter = this._register(new vscode.EventEmitter<vscode.Uri>());

	private _watcher: vscode.FileSystemWatcher | undefined;

	async getAllDocuments() {
		const resources = await vscode.workspace.findFiles(this._config.include, this._config.exclude);
		const docs = await Promise.all(resources.map(doc => this.getDocument(doc)));
		return docs.filter(doc => !!doc) as SkinnyTextDocument[];
	}

	async getDocument(resource: vscode.Uri): Promise<SkinnyTextDocument | undefined> {
		const matchingDocuments = vscode.workspace.textDocuments.filter(function(document) {
			return document.uri.toString() === resource.toString();
		});
		if (matchingDocuments.length !== 0) {
			return matchingDocuments[0];
		}

		const text = await readFileText(resource);

		const lines: SkinnyTextLine[] = [];
		const parts = text.split(/(\r?\n)/);
		const lineCount = Math.floor(parts.length / 2) + 1;
		for (let line = 0; line < lineCount; line++) {
			lines.push({
				text: parts[line * 2]
			});
		}

		return {
			uri: resource,
			version: 0,
			lineCount: lineCount,
			lineAt: function(index) {
				return lines[index];
			},
			getText: function() {
				return text;
			}
		};
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

	private ensureWatcher(): void {
		if (this._watcher) {
			return;
		}

		this._watcher = this._register(vscode.workspace.createFileSystemWatcher(this._config.include));

		this._watcher.onDidChange(async function(resource) {
			const document = await this.getDocument(resource);
			if (document) {
				this._onDidChangeDocumentEmitter.fire(document);
			}
		}, null, this._disposables);

		this._watcher.onDidCreate(async function(resource) {
			const document = await this.getDocument(resource);
			if (document) {
				this._onDidCreateDocumentEmitter.fire(document);
			}
		}, null, this._disposables);

		this._watcher.onDidDelete(async function(resource) {
			this._onDidDeleteDocumentEmitter.fire(resource);
		}, null, this._disposables);

		vscode.workspace.onDidChangeTextDocument(function(e) {
			if (this.isLanguageFile(e.document)) {
				this._onDidChangeDocumentEmitter.fire(e.document);
			}
		}, this, this._disposables);
	}

	public isLanguageFile(document: vscode.TextDocument) {
		return document.languageId === this._languageId;
	}
}

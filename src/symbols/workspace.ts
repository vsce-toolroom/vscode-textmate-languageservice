'use strict';

import vscode from 'vscode';
import { Disposable } from '../util/dispose';
import { Lazy, lazy } from '../util/lazy';
import { DocumentSymbolProvider } from './document';
import { SkinnyTextDocument, SkinnyTextLine, configurationData } from '../engine';

const extensions = configurationData.language.extensions.length === 1
	? `.{${configurationData.language.extensions.map((e: string) => e.substring(1)).join(',')}}`
	: configurationData.language.extensions[0];
const include = `**/*${extensions}`;

export interface WorkspaceDocumentProviderInterface {
	readonly _language: string;

	getAllDocuments(): Thenable<Iterable<SkinnyTextDocument>>;
	getDocument(resource: vscode.Uri): Thenable<SkinnyTextDocument | undefined>;

	readonly onDidChangeDocument: vscode.Event<SkinnyTextDocument>;
	readonly onDidCreateDocument: vscode.Event<SkinnyTextDocument>;
	readonly onDidDeleteDocument: vscode.Event<vscode.Uri>;
}

export class WorkspaceDocumentProvider extends Disposable implements WorkspaceDocumentProviderInterface {
	constructor(
		readonly _language: string
	) {
		super();
	}

	private readonly _onDidChangeDocumentEmitter = this._register(new vscode.EventEmitter<SkinnyTextDocument>());
	private readonly _onDidCreateDocumentEmitter = this._register(new vscode.EventEmitter<SkinnyTextDocument>());
	private readonly _onDidDeleteDocumentEmitter = this._register(new vscode.EventEmitter<vscode.Uri>());

	private _watcher: vscode.FileSystemWatcher | undefined;

	async getAllDocuments() {
		const exclude = configurationData.exclude;
		const resources = await vscode.workspace.findFiles(include, exclude);
		const docs = await Promise.all(resources.map(doc => this.getDocument(doc)));
		return docs.filter(doc => !!doc) as SkinnyTextDocument[];
	}

	async getDocument(resource: vscode.Uri): Promise<SkinnyTextDocument | undefined> {
		const matchingDocuments = vscode.workspace.textDocuments.filter((doc) => doc.uri.toString() === resource.toString());
		if (matchingDocuments.length !== 0) {
			return matchingDocuments[0];
		}

		const bytes = await vscode.workspace.fs.readFile(resource);

		// We assume that the language is in UTF-8
		const text = Buffer.from(bytes).toString('utf-8');

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

		this._watcher = this._register(vscode.workspace.createFileSystemWatcher(include));

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
		return document.languageId === this._language;
	}
}

export class WorkspaceSymbolProvider extends Disposable implements vscode.WorkspaceSymbolProvider {
	private _symbolCache = new Map<string, Lazy<Thenable<vscode.SymbolInformation[]>>>();
	private _symbolCachePopulated: boolean = false;

	public constructor(
		private _language: string,
		private _symbolProvider: DocumentSymbolProvider,
		private _workspaceDocumentProvider: WorkspaceDocumentProvider = new WorkspaceDocumentProvider(_language)
	) {
		super();
	}

	public async provideWorkspaceSymbols(query: string): Promise<vscode.SymbolInformation[]> {
		if (!this._symbolCachePopulated) {
			await this.populateSymbolCache();
			this._symbolCachePopulated = true;

			this._workspaceDocumentProvider.onDidChangeDocument(this.onDidChangeDocument, this, this._disposables);
			this._workspaceDocumentProvider.onDidCreateDocument(this.onDidChangeDocument, this, this._disposables);
			this._workspaceDocumentProvider.onDidDeleteDocument(this.onDidDeleteDocument, this, this._disposables);
		}

		const allSymbolsSets = await Promise.all(Array.from(this._symbolCache.values(), x => x.value));
		const allSymbols = [].concat(...allSymbolsSets);
		return allSymbols.filter(symbolInformation => symbolInformation.name.toLowerCase().indexOf(query.toLowerCase()) !== -1);
	}

	public async populateSymbolCache(): Promise<void> {
		const documentUris = await this._workspaceDocumentProvider.getAllDocuments();
		for (const document of documentUris) {
			this._symbolCache.set(document.uri.fsPath, this.getSymbols(document));
		}
	}

	private getSymbols(document: SkinnyTextDocument): Lazy<Thenable<vscode.SymbolInformation[]>> {
		return lazy(async function() {
			return this._symbolProvider.provideDocumentSymbolInformation(document);
		}.bind(this));
	}

	private onDidChangeDocument(document: SkinnyTextDocument) {
		this._symbolCache.set(document.uri.fsPath, this.getSymbols(document));
	}

	private onDidDeleteDocument(resource: vscode.Uri) {
		this._symbolCache.delete(resource.fsPath);
	}
}

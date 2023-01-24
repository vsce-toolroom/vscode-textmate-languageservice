'use strict';

import type * as vscode from 'vscode';
import { Disposable } from './util/dispose';
import type { Lazy } from './util/lazy';
import { lazy } from './util/lazy';
import type { TextmateDocumentSymbolProvider } from './document-symbol';
import type { SkinnyTextDocument, WorkspaceDocumentService } from './services/document';

export class TextmateWorkspaceSymbolProvider extends Disposable implements vscode.WorkspaceSymbolProvider {
	constructor(private _documentService: WorkspaceDocumentService, private _documentSymbols: TextmateDocumentSymbolProvider) {
		super();
	}

	private _symbolCache = new Map<string, Lazy<Thenable<vscode.SymbolInformation[]>>>();
	private _symbolCachePopulated: boolean = false;

	public async provideWorkspaceSymbols(query: string): Promise<vscode.SymbolInformation[]> {
		if (!this._symbolCachePopulated) {
			await this.populateSymbolCache();
			this._symbolCachePopulated = true;
			this._documentService.onDidChangeDocument(this.onDidChangeDocument, this, this._disposables);
			this._documentService.onDidCreateDocument(this.onDidChangeDocument, this, this._disposables);
			this._documentService.onDidDeleteDocument(this.onDidDeleteDocument, this, this._disposables);
		}

		const allSymbolsSets = await Promise.all(Array.from(this._symbolCache.values(), x => x.value));
		const allSymbols = [].concat(...allSymbolsSets);
		return allSymbols.filter(symbolInformation => symbolInformation.name.toLowerCase().indexOf(query.toLowerCase()) !== -1);
	}

	private async populateSymbolCache(): Promise<void> {
		const documentUris = await this._documentService.getAllDocuments();
		for (const document of documentUris) {
			this._symbolCache.set(document.uri.fsPath, this.getSymbols(document));
		}
	}

	private getSymbols(document: SkinnyTextDocument): Lazy<Thenable<vscode.SymbolInformation[]>> {
		const that = this._documentSymbols;
		return lazy(that.provideDocumentSymbolInformation.bind(that, document));
	}

	private onDidChangeDocument(document: SkinnyTextDocument) {
		this._symbolCache.set(document.uri.fsPath, this.getSymbols(document));
	}

	private onDidDeleteDocument(resource: vscode.Uri) {
		this._symbolCache.delete(resource.fsPath);
	}
}

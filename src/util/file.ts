'use strict';

import * as vscode from 'vscode';
import { SkinnyTextDocument } from '../textmateEngine';

interface WorkspaceDocumentDisposable extends vscode.Disposable {
	readonly _language: string;

	getAllDocuments(): Thenable<Iterable<SkinnyTextDocument>>;
	getDocument(resource: vscode.Uri): Thenable<SkinnyTextDocument | undefined>;

	readonly onDidChangeDocument: vscode.Event<SkinnyTextDocument>;
	readonly onDidCreateDocument: vscode.Event<SkinnyTextDocument>;
	readonly onDidDeleteDocument: vscode.Event<vscode.Uri>;
}

export function isLanguageFile(this: WorkspaceDocumentDisposable, document: vscode.TextDocument) {
	return document.languageId === this._language;
}

'use strict';

import * as path from 'path';
import * as vscode from 'vscode';

import { MockGlobalMemento, MockMemento } from './memento';
import { StubSecretStorage } from './secret';
import { MockEnvironmentVariableCollection } from './variables';

import { default as TextmateLanguageService } from '../../src/main';

const resolver = new TextmateLanguageService.utils.ResolverService(
	TextmateLanguageService.utils.getOniguruma()
);

export class MockExtensionContext implements vscode.ExtensionContext {
	public readonly subscriptions: vscode.Disposable[];

	public readonly workspaceState: vscode.Memento;
	public readonly globalState: vscode.Memento & { setKeysForSync(_: readonly string[]): void };

	public readonly secrets: vscode.SecretStorage;

	public readonly environmentVariableCollection: vscode.EnvironmentVariableCollection;

	public readonly storageUri: vscode.Uri;
	public readonly storagePath: string;
	public readonly globalStorageUri: vscode.Uri;
	public readonly globalStoragePath: string;
	public readonly logUri: vscode.Uri;
	public readonly logPath: string;

	public readonly extensionUri: vscode.Uri;
	public readonly extensionPath: string;

	public asAbsolutePath: (relativePath: string) => string;

	public readonly extensionMode: vscode.ExtensionMode;
	public readonly extension: vscode.Extension<any>;

	constructor(id: string) {
		this.subscriptions = [];

		this.workspaceState = new MockMemento();
		this.globalState = new MockGlobalMemento();

		this.secrets = new StubSecretStorage();

		this.environmentVariableCollection = new MockEnvironmentVariableCollection();

		const codeRoot = path.posix.resolve(path.posix.normalize(vscode.env.appRoot), '../../..');
		this.globalStoragePath = `${codeRoot}/user-data/User/globalStorage`;
		this.globalStorageUri = vscode.Uri.file(this.globalStoragePath);
		this.storagePath = `${codeRoot}/user-data/User/workspaceStorage`;
		this.storageUri = vscode.Uri.file(this.globalStoragePath);
		this.logPath = `${codeRoot}/user-data/User/logs`;
		this.logUri = vscode.Uri.file(this.logPath);

		const extension = resolver.getExtensionFromLanguageId(id) as vscode.Extension<any>;
		if (typeof extension === 'undefined') {
			if (globalThis.languageId === id) {
				throw new Error('Could not find extension for language ID "' + id +'"');
			}
			return;
		}

		const extensionUri = this.extensionUri = extension.extensionUri;
		this.extensionPath = extension.extensionUri.path;

		this.asAbsolutePath = function(relativePath: string): string {
			return vscode.Uri.joinPath(extensionUri, relativePath).toString();
		};

		this.extensionMode = vscode.ExtensionMode.Development;
		this.extension = extension;
	}
}

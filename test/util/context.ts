'use strict';

import * as vscode from 'vscode';
import * as path from 'path';

class MockMemento implements vscode.Memento {
	keys(): readonly string[] {
		return [];
	}
	get<T = void>(_1: string): T;
	get<T = void>(_1: string, _2: T): T;
	get<T = void>(_1: string, _2?: T): T {
		return;
	}
	update(_1: string, _2: any): Thenable<void> {
		return;
	}
}

class MockGlobalMemento extends MockMemento implements vscode.Memento {
	setKeysForSync(_: readonly string[]): void {
		return;
	}
}

type EnvironmentVariableCollectionCallbackFn = (
	variable: string,
	mutator: vscode.EnvironmentVariableMutator,
	collection: vscode.EnvironmentVariableCollection
) => any;

class MockEnvironmentVariableCollection implements vscode.EnvironmentVariableCollection {
	constructor(public persistent: boolean = true) {}
	replace(_1: string, _2: string): void { return; };
	append(_1: string, _2: string): void { return; };
	prepend(_1: string, _2: string): void { return; };
	get(_1: string): vscode.EnvironmentVariableMutator {
		return { type: vscode.EnvironmentVariableMutatorType.Replace, value: '' };
	}
	forEach(_1: EnvironmentVariableCollectionCallbackFn, _2?: any): void { return; }
	delete(_: string): void { return; }
	clear(): void { return; }
}

class SecretStorage implements vscode.SecretStorage {
	get(_: string): Thenable<string> {
		return Promise.resolve('');
	}
	store(_1: string, _2: string): Thenable<void> {
		return;
	}
	delete(_: string): Thenable<void> {
		return;
	}
	onDidChange: vscode.Event<vscode.SecretStorageChangeEvent>;
}

const appRoot = path.normalize(vscode.env.appRoot);


function generateStoragePath() {
	return path.join(appRoot, '..', '..', '..', 'user-data', 'User', 'globalStorage');
}
function generateGlobalStoragePath() {
	return path.join(appRoot, '..', '..', '..', 'user-data', 'User', 'workspaceStorage');
}
function generateLogPath() {
	return path.join(appRoot, '..', '..', '..', 'user-data', 'User', 'logs');
}

class MockExtensionContext implements vscode.ExtensionContext {
	constructor(id: string) {
		const extension = vscode.extensions.getExtension(id);

		this.subscriptions = [];

		this.workspaceState = new MockMemento();
		this.globalState = new MockGlobalMemento();

		this.secrets = new SecretStorage();

		this.extensionUri = extension.extensionUri;
		this.extensionPath = extension.extensionUri.path;

		this.asAbsolutePath = function(relativePath: string): string {
			return vscode.Uri.joinPath(this.extensionUri, relativePath).toString();
		};

		this.environmentVariableCollection = new MockEnvironmentVariableCollection();

		this.globalStoragePath = generateStoragePath();
		this.globalStorageUri = vscode.Uri.file(this.globalStoragePath);
		this.storagePath = generateStoragePath();
		this.storageUri = vscode.Uri.file(this.globalStoragePath);
		this.logPath = generateLogPath();
		this.logUri = vscode.Uri.file(this.logPath);

		this.extensionMode = vscode.ExtensionMode.Development;
		this.extension = extension;
	}

	public readonly subscriptions: vscode.Disposable[];

	public readonly workspaceState: vscode.Memento;
	public readonly globalState: vscode.Memento & { setKeysForSync(_: readonly string[]): void; };

	public readonly secrets: vscode.SecretStorage;

	public readonly extensionUri: vscode.Uri;
	public readonly extensionPath: string;

	asAbsolutePath: (relativePath: string) => string;

	public readonly environmentVariableCollection: vscode.EnvironmentVariableCollection;

	public readonly storageUri: vscode.Uri;
	public readonly storagePath: string;
	public readonly globalStorageUri: vscode.Uri;
	public readonly globalStoragePath: string;
	public readonly logUri: vscode.Uri;
	public readonly logPath: string;

	public readonly extensionMode: vscode.ExtensionMode;
	public readonly extension: vscode.Extension<any>;
}

const context: vscode.ExtensionContext = new MockExtensionContext('Gimly81.matlab');

export default context;

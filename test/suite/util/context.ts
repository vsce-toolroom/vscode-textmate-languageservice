'use strict';

import * as vscode from 'vscode';
import * as path from 'path';

class MockMemento implements vscode.Memento {
	keys(): readonly string[] {
		return [];
	}
	get<T = void>(key: string): T;
	get<T = void>(key: string, defaultValue: T): T;
	get<T = void>(key: string, defaultValue?: T): T {
		return;
	}
	update(key: string, value: any): Thenable<void> {
		return;
	}
}

class MockGlobalMemento extends MockMemento implements vscode.Memento {
	setKeysForSync(keys: readonly string[]): void {
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
	replace(variable: string, value: string): void { return; };
	append(variable: string, value: string): void { return; };
	prepend(variable: string, value: string): void { return; };
	get(variable: string): vscode.EnvironmentVariableMutator {
		return { type: vscode.EnvironmentVariableMutatorType.Replace, value: '' };
	}
	forEach(callback: EnvironmentVariableCollectionCallbackFn, thisArg?: any): void { return; }
	delete(variable: string): void { return; }
	clear(): void { return; }
}

class SecretStorage implements vscode.SecretStorage {
	get(key: string): Thenable<string> {
		return Promise.resolve('');
	}
	store(key: string, value: string): Thenable<void> {
		return;
	}
	delete(key: string): Thenable<void> {
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

	subscriptions: vscode.Disposable[];

	workspaceState: vscode.Memento;
	globalState: vscode.Memento & { setKeysForSync(keys: readonly string[]): void; };

	secrets: vscode.SecretStorage;

	extensionUri: vscode.Uri;
	extensionPath: string;

	asAbsolutePath: (relativePath: string) => string;

	environmentVariableCollection: vscode.EnvironmentVariableCollection;

	storageUri: vscode.Uri;
	storagePath: string;
	globalStorageUri: vscode.Uri;
	globalStoragePath: string;
	logUri: vscode.Uri;
	logPath: string;

	extensionMode: vscode.ExtensionMode;
	extension: vscode.Extension<any>;
}

const context: vscode.ExtensionContext = new MockExtensionContext('Gimly81.matlab');

export default context;

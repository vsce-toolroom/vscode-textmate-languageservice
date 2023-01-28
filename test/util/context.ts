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

export class SecretStorage {
    get(_: string): Thenable<string | undefined> {
        return Promise.resolve('●●●●●●●●●●●●●●●●');
    }
    store(_1: string, _2: string): Thenable<void> {
        return Promise.resolve();
    }
    delete(_1: string): Thenable<void> {
        return Promise.resolve();
    }
    onDidChange = new vscode.EventEmitter<vscode.SecretStorageChangeEvent>().event;
}


type EnvironmentVariableCollectionCallbackFn = (
	variable: string,
	mutator: vscode.EnvironmentVariableMutator,
	collection: vscode.EnvironmentVariableCollection
) => any;

class MockEnvironmentVariableCollection implements vscode.EnvironmentVariableCollection {
	readonly map: Map<string, vscode.EnvironmentVariableMutator> = new Map();
	private _persistent: boolean = true;
	public get persistent(): boolean { return this._persistent; }
	public set persistent(value: boolean) {
		this._persistent = value;
	}
	constructor(serialized?: [string, vscode.EnvironmentVariableMutator][]) {
		this.map = new Map(serialized);
	}
	get size(): number {
		return this.map.size;
	}
	replace(_1: string, _2: string): void {}
	append(_1: string, _2: string): void {}
	prepend(_1: string, _2: string): void {}
	get(variable: string): vscode.EnvironmentVariableMutator | undefined {
		return this.map.get(variable);
	}
	forEach(_1: Parameters<vscode.EnvironmentVariableCollection['forEach']>[0], _2?: any): void {}
	[Symbol.iterator](): IterableIterator<[variable: string, mutator: vscode.EnvironmentVariableMutator]> {
		return this.map.entries();
	}
	delete(_1: string): void {}
	clear(): void {}
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

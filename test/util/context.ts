'use strict';

import * as path from 'path';
import * as vscode from 'vscode';

export class MockMemento implements vscode.Memento {
	public keys(): readonly string[] {
		return [];
	}
	public get<T = void>(_1: string): T;
	public get<T = void>(_1: string, _2?: T): T {
		return void 0 as T;
	}
	public update(_1: string, _2: any): Thenable<void> {
		return Promise.resolve();
	}
}

export class MockGlobalMemento extends MockMemento implements vscode.Memento {
	public setKeysForSync(_: readonly string[]): void {
		return void 0;
	}
}

export class SecretStorage {
	public onDidChange = new vscode.EventEmitter<vscode.SecretStorageChangeEvent>().event;
	public get(_: string): Thenable<string | undefined> {
		return Promise.resolve('●●●●●●●●●●●●●●●●');
	}
	public store(_1: string, _2: string): Thenable<void> {
		return Promise.resolve();
	}
	public delete(_1: string): Thenable<void> {
		return Promise.resolve();
	}
}

export class MockEnvironmentVariableCollection implements vscode.EnvironmentVariableCollection {
	private readonly map: Map<string, vscode.EnvironmentVariableMutator> = new Map();
	private _persistent = true;
	constructor(serialized?: Array<[string, vscode.EnvironmentVariableMutator]>) {
		this.map = new Map(serialized);
	}
	public get size(): number {
		return this.map.size;
	}
	public get persistent(): boolean {
		return this._persistent;
	}
	public set persistent(value: boolean) {
		this._persistent = value;
	}
	public replace(_1: string, _2: string): void {
		return void 0;
	}
	public append(_1: string, _2: string): void {
		return void 0;
	}
	public prepend(_1: string, _2: string): void {
		return void 0;
	}
	public get(variable: string): vscode.EnvironmentVariableMutator | undefined {
		return this.map.get(variable);
	}
	public forEach(_1: Parameters<vscode.EnvironmentVariableCollection['forEach']>[0], _2?: any): void {
		return void 0;
	}
	public [Symbol.iterator](): IterableIterator<[variable: string, mutator: vscode.EnvironmentVariableMutator]> {
		return this.map.entries();
	}
	public delete(_1: string): void {
		return void 0;
	}
	public clear(): void {
		return void 0;
	}
}

export class MockExtensionContext<ExtensionExports = void> implements vscode.ExtensionContext {
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
	public readonly extension: vscode.Extension<ExtensionExports>;

	constructor(id: string) {
		this.subscriptions = [];

		this.workspaceState = new MockMemento();
		this.globalState = new MockGlobalMemento();

		this.secrets = new SecretStorage();

		this.environmentVariableCollection = new MockEnvironmentVariableCollection();

		const codeRoot = path.posix.resolve(path.posix.normalize(vscode.env.appRoot), '../../..');
		this.globalStoragePath = `${codeRoot}/user-data/User/globalStorage`;
		this.globalStorageUri = vscode.Uri.file(this.globalStoragePath);
		this.storagePath = `${codeRoot}/user-data/User/workspaceStorage`;
		this.storageUri = vscode.Uri.file(this.globalStoragePath);
		this.logPath = `${codeRoot}/user-data/User/logs`;
		this.logUri = vscode.Uri.file(this.logPath);

		const extension = vscode.extensions.getExtension<ExtensionExports>(id);
		if (typeof extension === 'undefined') {
			console.log(`extension ID "${id}" not found`);
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
